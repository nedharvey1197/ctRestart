const TypeDoc = require('typedoc');
const fs = require('fs');

async function generateDocumentation() {
  const app = new TypeDoc.Application();
  
  app.options.addReader(new TypeDoc.TSConfigReader());
  app.options.addReader(new TypeDoc.TypeDocReader());

  const project = app.convert();
  if (project) {
    await app.generateDocs(project, 'docs');
  }
}

generateDocumentation(); 