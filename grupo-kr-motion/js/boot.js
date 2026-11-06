/* Roda antes da primeira pintura: liga o modo "js" e arma o plano B.
 * Se o motion.js não confirmar em 4s (script bloqueado, erro), o CSS mostra tudo sem skeleton. */
(() => {
  var root = document.documentElement;
  root.classList.add('js');
  window.setTimeout(() => {
    if (!root.classList.contains('motion-ok')) root.classList.add('motion-timeout');
  }, 4000);
})();
