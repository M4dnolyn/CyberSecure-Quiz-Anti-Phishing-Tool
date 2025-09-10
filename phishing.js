document.getElementById("check-btn").addEventListener("click", () => {
  const url = document.getElementById("url-input").value;
  if (!url) {
    alert("⚠️ Merci d'entrer une URL !");
    return;
  }

  checkPhishing(url);
});

function checkPhishing(url) {
  const resultArea = document.getElementById("result-area");
  resultArea.innerText = "Analyse de l'URL : " + url;
}
