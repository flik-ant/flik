const axios = require('axios');
const handlebars = require('handlebars');
const jq = require('node-jq');

const concat = list => Array.prototype.concat.bind(list)
const promiseConcat = f => x => f().then(concat(x))
const promiseReduce = (acc, x) => acc.then(promiseConcat(x))
const serial = funcs => funcs.reduce(promiseReduce, Promise.resolve([]))

//
module.exports.exec = async (definition, input) => {
  const d = JSON.parse(definition);
  const ctxBuilder = buildTemplateContext(input);
  let output = {};

  const res = await serial(d.stages.map(stage => {
    return async () => {
      const ctx = ctxBuilder(output);
      const templateApplier = applyTemplate(ctx);
      output[stage.name] = {};

      const steps = stage.steps.map(async step => {
        output[stage.name][step.name] = {};

        const res = await axios({
          method: step.method,
          url: templateApplier(step.url),
          data: applyTemplateToObject(templateApplier, step.body),
          headers: applyTemplateToObject(templateApplier, step.headers)
        });

        if (step.output === undefined)
          return;

        await Promise.all(Object.keys(step.output).map(async outName => {
          output[stage.name][step.name][outName] = await jq.run(step.output[outName], res.data, { input: 'json' });
        }));
      });

      await Promise.all(steps);
    }
  }));

  return res
}

const applyTemplate = ctx => tmpl => handlebars.compile(tmpl)(ctx)
const applyTemplateToObject = (applierFn, obj) => {
  if (obj === undefined)
    return {};
  let newObject = {};
  Object.keys(obj).forEach((prop) => { newObject[prop] = applierFn(obj[prop]) });
  return newObject;
}
const buildTemplateContext = input => output => { return { input: input, output: output } }
