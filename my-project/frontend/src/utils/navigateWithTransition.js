export function navigateWithTransition(navigate, path) {
  const currentPath =
    window.location.pathname + window.location.search;

  if (currentPath === path) {
    return;
  }

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (
    typeof document.startViewTransition === "function" &&
    !reducedMotion
  ) {
    document.startViewTransition(() => {
      navigate(path);
    });
  } else {
    navigate(path);
  }
}