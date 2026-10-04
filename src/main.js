
const API_KEY = import.meta.env.VITE_NASA_API_KEY;

const app = document.querySelector("#app");
const datepicker = document.querySelector("#datepicker");
const todayButton = document.querySelector("#todayButton");
const randomButton = document.querySelector("#randomButton");
const nasaButton = document.querySelector("#nasaButton");
const asteroidButton = document.querySelector("#asteroidButton");
const asteroidResults = document.querySelector("#asteroidResults");

let currentAPOD = null;

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
      currentAPOD = apod;

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

function loadAsteroids(date) {
  const selectedDate = date || new Date().toISOString().slice(0, 10);

  asteroidResults.innerHTML = "loading...";

  fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${selectedDate}&end_date=${selectedDate}&api_key=DEMO_KEY`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`NASA ${response.status}`);
      }

      return response.json();
    })
    .then(data => {
      const asteroids = data.near_earth_objects[selectedDate] || [];

      if (asteroids.length === 0) {
        asteroidResults.innerHTML = "No asteroids found.";
        return;
      }

      asteroidResults.innerHTML = `<strong>${asteroids.length} objects</strong>`;

      asteroids.forEach(asteroid => {
        const approach = asteroid.close_approach_data[0];
        const size = asteroid.estimated_diameter.meters;

        asteroidResults.innerHTML += `
          <div class="asteroid">
            <h3>${asteroid.name}</h3>

            <p>Size:
              ${Math.round(size.estimated_diameter_min)} -
              ${Math.round(size.estimated_diameter_max)} m
            </p>

            <p>Speed:
              ${Math.round(
                approach.relative_velocity.kilometers_per_second
              )} km/s
            </p>

            <p>Miss distance:
              ${Math.round(
                Number(approach.miss_distance.kilometers)
              ).toLocaleString()} km
            </p>
          </div>
        `;
      });
    })
    .catch(error => {
      asteroidResults.innerHTML = `Error: ${error.message}`;
    });
}

loadAPOD();

datepicker.addEventListener("change", () => {
  loadAPOD(datepicker.value);
});

todayButton.addEventListener("click", () => {
  datepicker.value = "";
  loadAPOD();
});

randomButton.addEventListener("click", () => {
  const start = new Date(1995, 5, 16);
  const end = new Date();

  const time = start.getTime() +
    Math.random() * (end.getTime() - start.getTime());

  const randomDate = new Date(time);

  const year = randomDate.getFullYear();
  const month = String(randomDate.getMonth() + 1).padStart(2, "0");
  const day = String(randomDate.getDate()).padStart(2, "0");

  datepicker.value = `${year}-${month}-${day}`;
  loadAPOD(datepicker.value);
});

nasaButton.addEventListener("click", () => {
  if (currentAPOD?.url) {
    window.open(currentAPOD.url, "_blank");
  }
});

asteroidButton.addEventListener("click", () => {
  loadAsteroids(datepicker.value);
});
