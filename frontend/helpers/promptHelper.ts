export const extractRequiredVariables = (prompts: Record<string, string>) => {
  const variableRegex = /\{([^}]+)\}/g;

  return Object.entries(prompts).reduce((acc, [promptName, promptText]) => {
    const matches = [...promptText.matchAll(variableRegex)].map((match) => match[0]);
    acc[promptName] = matches;
    return acc;
  }, {} as Record<string, string[]>);
};
