export function bindEventCallback(id, callback, event = "click") {
  const dom = document.getElementById(id);
  dom.addEventListener(event, () => {
    callback.call();
  });
}
