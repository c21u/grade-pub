/**
 * Turn an array into an array of arrays each with a maximum size
 *
 * @param {Array}       arr               The array to split into chunks
 * @param {int}         size              The size of the array chunks that should   be returned
 * @return {Array}
 */
export const chunk = function (arr, size) {
  const chunks = [];
  const n = arr.length;
  let i = 0;

  while (i < n) {
    chunks.push(arr.slice(i, (i += size)));
  }
  return chunks;
};
