/**
 * Turn an array into an array of arrays each with a maximum size
 *
 * @param {Array}       arr               The array to split into chunks
 * @param {int}         size              The size of the array chunks that should   be returned
 * @return {Array}
 */
export const chunk = (arr, size) => {
  const chunks = [];
  const n = arr.length;
  let i = 0;

  while (i < n) {
    chunks.push(arr.slice(i, (i += size)));
  }
  return chunks;
};

export const isInstructor = (context) => {
  return context?.roles && context.roles.includes("http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor") || context.roles.includes("http://purl.imsglobal.org/vocab/lis/v2/institution/person#Instructor");
};
