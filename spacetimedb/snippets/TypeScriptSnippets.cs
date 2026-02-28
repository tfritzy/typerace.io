namespace StdbModule;

public static class TypeScriptSnippets
{
    public static readonly string[] Sources = new string[]
    {
        "medusajs/medusa (MIT)",
        "strapi/strapi (SEE LICENSE)",
        "mattermost/mattermost (AGPL-3.0/Apache-2.0)",
        "tfritzy/typeracing.io",
    };

    public static readonly string[] Snippets = new string[]
    {
        "if (await dbExists(client, dbName)) {\n    logger.info(`Database \"${dbName}\" already exists`)\n\n    envEditor.set(\"DB_NAME\", dbName, { withEmptyTemplateValue: true })\n    await envEditor.save()\n    logger.info(`Updated .env file with \"DB_NAME=${dbName}\"`)\n\n    return true\n}",
        "try {\n  const created = await dbCreate({ directory, interactive, db });\n  process.exit(created ? 0 : 1);\n} catch (error) {\n  if (error.name === \"ExitPromptError\") {\n    process.exit();\n  }\n  logger.error(error);\n  process.exit(1);\n}",
        "const plugins = await getResolvedPlugins(directory, configModule, true)\nmergePluginModules(configModule, plugins)\n\nconst linksSourcePaths = plugins.map((plugin) =>\n  join(plugin.resolve, \"links\")\n)\nawait new LinkLoader(linksSourcePaths).load()",
        "if (!skipLinks) {\n  console.log(new Array(TERMINAL_SIZE).join(\"-\"));\n  await syncLinks(medusaAppLoader, {\n    executeAll: executeAllLinks,\n    executeSafe: executeSafeLinks,\n  });\n}",
        "const created = await dbCreate({ directory, interactive, db });\nif (!created) {\n  process.exit(1);\n}\n\nconst migrated = await migrate({\n  directory,\n  skipLinks,\n  skipScripts,\n  executeAllLinks,\n  executeSafeLinks,\n});\n\nprocess.exit(migrated ? 0 : 1);",
        "for (const path of modulePaths) {\n  const moduleDirname = dirname(path);\n  const serviceName = await getModuleServiceName(path);\n  const entities = await getEntitiesForModule(moduleDirname);\n\n  moduleDescriptors.push({\n    serviceName,\n    migrationsPath: join(moduleDirname, \"migrations\"),\n    entities,\n  });\n}",
        "await page.getByRole('link', { name: 'Content Manager' }).click();\nawait page.getByRole('link', { name: 'Author' }).click();\nawait expect(page.getByRole('gridcell', { name: 'Draft' })).toHaveCount(3);\nawait expect(page.getByRole('link', { name: 'Next page' })).not.toBeVisible();",
        "await page.waitForSelector('text=Are you sure you want to delete these entries?');\nconst confirmDeleteButton = page\n  .getByLabel('Confirm')\n  .getByRole('button', { name: 'Confirm' });\nawait confirmDeleteButton.click();\nawait page.waitForSelector('text=No content found');",
        "const pageNumber = parseInt(page, 10);\nconst pageSizeNumber = parseInt(pageSize, 10);\n\nif (Number.isNaN(pageNumber) || pageNumber < 1) {\n    throw new PaginationError('invalid pageNumber param');\n}\nif (Number.isNaN(pageSizeNumber) || pageSizeNumber < 1) {\n    throw new PaginationError('invalid pageSize param');\n}",
        "if (!isNil(actionConfig)) {\n  const [controller, action] = actionConfig.split(\".\");\n\n  if (controller && action) {\n    return controllers[controller.toLowerCase()][action](ctx, next);\n  }\n}",
        "if (this.connectFailCount > this.config.maxWebSocketFails) {\n  retryTime = retryTime * this.connectFailCount * this.connectFailCount;\n  if (retryTime > this.config.maxWebSocketRetryTime) {\n    retryTime = this.config.maxWebSocketRetryTime;\n  }\n}",
        "if (msg.seq !== this.serverSequence) {\n  this.connectFailCount = 0;\n  this.responseSequence = 1;\n  this.conn?.close();\n  return;\n}",
        "if (this.conn && this.conn.readyState === WebSocket.OPEN) {\n  this.conn.send(JSON.stringify(msg));\n}",
        "const category = this.getCategoryForWpm(wpm);\nconst prefix =\n  this.prefixes[category][\n    Math.floor(Math.random() * this.prefixes[category].length)\n  ];\nconst suffix =\n  this.suffixes[category][\n    Math.floor(Math.random() * this.suffixes[category].length)\n  ];\nreturn `${prefix} Typewriter ${suffix}`;",
        "Date.prototype.getDayOfYear = function () {\n  const start = new Date(this.getFullYear(), 0, 0);\n  const diff = (this as Date).getTime() - start.getTime();\n  const oneDay = 1000 * 60 * 60 * 24;\n  return Math.floor(diff / oneDay);\n};",
        "const response = await fetch(getFindGameUrl(), {\n  method: \"POST\",\n  headers: {\n    \"Content-Type\": \"application/json\",\n    Authorization: `Bearer ${token}`,\n  },\n  body: JSON.stringify({\n    displayName: name,\n    mode: mode,\n  }),\n});",
    };
}
