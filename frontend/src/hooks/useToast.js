const useToast = () => {
  const showToast = (msg) => {
    const el = document.createElement("div");
    el.className = "cooklio-toast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, 2500);
  };

  function showErrorToast(msg) {
    const el = document.createElement("div");
    el.className = "cooklio-error-toast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, 2500);
  }

  return { showToast, showErrorToast };
};

export default useToast;
