# Workflow Definition
The workflow is the execution rule specification, it works like a template which
can be executed by **flik**.

## Overview
Lets say we have this sample workflow speficication:

```
Workflow Spec
┗ Stage 1
  ┣ Step 1
  ┗ Step 2
┗ Stage 2
  ┗ Step 1
```

The **Stage 2** will be started only when all the **steps** from **Stage 1**
end successfully. While the **Stage 1** **steps** 1 and 2 will be executed
at the same time.

## Structure
It is internally separated in some structures, those strucutures enable it
interpolate between *serial* and *parallel* executions these structures are
**stages** and **steps**.

The relation between these two concepts is that a **stage** can have multiple
**steps** but a **step** can have just one **stage**.
