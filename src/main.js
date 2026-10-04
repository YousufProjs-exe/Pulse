
const API_KEY = import.meta.env.VITE_NASA_API_KEY;

const app = document.querySelector("#app");
const datepicker = document.querySelector("#datepicker");

// used AI only for this function, that too because of outdated guide provided.
function loadAPOD(date = "") {
  app.innerHTML = "<p>loading...</p>";

  let url;

  if (date) {
    const [year, month, day] = date.split("-");
    const shortDate = `${year.slice(2)}${month}${day}`;

    url = `https://science.nasa.gov/wp-json/wp/v2/apod-basic/${shortDate}?api_key=${API_KEY}`;
  } else {
    url = `https://science.nasa.gov/wp-json/wp/v2/apod-basic/?api_key=${API_KEY}`;
  }

  console.log("Fetching:", url);

  fetch(url)
    .then(response => {
      if (!response.ok) {
        return response.text().then(error => {
          throw new Error(`NASA ${response.status}: ${error}`);
        });
      }

      return response.json();
    })
    .then(data => {
      const apod = Array.isArray(data) ? data[0] : data;

      if (!apod || apod.error) {
        throw new Error(apod?.error?.message || "No APOD data received.");
      }

      let media;

      if (apod.media_type === "image") {
        media = `<img src="${apod.hdurl || apod.url}" alt="${apod.alt || apod.title}">`;
      } else if (apod.media_type === "iframe") {
        media = `<iframe src="${apod.url}" title="${apod.title}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`;
      } else {
        media = `<video src="${apod.url}" controls></video>`;
      }

      app.innerHTML = `
        <h1>${apod.title}</h1>
        ${media}
        <p>${apod.explanation}</p>
      `;
    })
    .catch(err => {
      app.innerHTML = `<p>Error: ${err.message}</p>`;
    });
}

loadAPOD();

datepicker.addEventListener("change", () => {
  loadAPOD(datepicker.value);
});
