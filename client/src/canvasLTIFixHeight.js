const CanvasLTIFixHeight = (additional) => {
  const offset = document.body.offsetHeight + additional;
  parent.postMessage(`{"subject":"lti.frameResize", "height": ${offset}}`, "*");
};

export default CanvasLTIFixHeight;
