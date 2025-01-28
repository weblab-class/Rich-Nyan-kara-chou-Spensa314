/**
 * Utility functions to make API requests.
 * By importing this file, you can use the provided get and post functions.
 * You shouldn't need to modify this file, but if you want to learn more
 * about how these functions work, google search "Fetch API"
 *
 * These functions return promises, which means you should use ".then" on them.
 * e.g. get('/api/foo', { bar: 0 }).then(res => console.log(res))
 */

// ex: formatParams({ some_key: "some_value", a: "b"}) => "some_key=some_value&a=b"
function formatParams(params) {
  // iterate of all the keys of params as an array,
  // map it to a new array of URL string encoded key,value pairs
  // join all the url params using an ampersand (&).
  return Object.keys(params)
    .map((key) => key + "=" + encodeURIComponent(params[key]))
    .join("&");
}

// convert a fetch result to a JSON object with error handling for fetch and json errors
function convertToJSON(res) {
  if (!res.ok) {
    throw `API request failed with response status ${res.status} and text: ${res.statusText}`;
  }

  return res
    .clone() // clone so that the original is still readable for debugging
    .json() // start converting to JSON object
    .catch((error) => {
      // throw an error containing the text that couldn't be converted to JSON
      return res.text().then((text) => {
        throw `API request's result could not be converted to a JSON object: \n${text}`;
      });
    });
}

// Helper code to make a get request. Default parameter of empty JSON Object for params.
// Returns a Promise to a JSON Object.
export function get(endpoint, params = {}) {
  const fullPath = endpoint + "?" + formatParams(params);
  return fetch(fullPath)
    .then(convertToJSON)
    .catch((error) => {
      // give a useful error message
      throw `GET request to ${fullPath} failed with error:\n${error}`;
    });
}

// Helper code to make a post request. Default parameter of empty JSON Object for params.
// Returns a Promise to a JSON Object.
export function post(endpoint, params = {}) {
  return fetch(endpoint, {
    method: "post",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(params),
  })
    .then(convertToJSON) // convert result to JSON object
    .catch((error) => {
      // give a useful error message
      throw `POST request to ${endpoint} failed with error:\n${error}`;
    });
}

export const updateThemeVariables = (newTheme) => {
  const root = document.documentElement;

  // Loop through the theme object and update the CSS variables
  Object.keys(newTheme).forEach((key) => {
    root.style.setProperty(key, newTheme[key]);
  });
};

export const resetThemeVariables = () => {
  const root = document.documentElement;

  // Define your default theme variables here
  const defaultTheme = {
    "--white": "#fff",
    "--light--beige": "#ffebdd",
    "--dull--beige": "#ede0d4",
    "--beige": "#fae0cf",
    "--off--beige": "#f2d3be",
    "--dark--beige": "#e1b89c",
    "--off--dark--beige": "#d2a68a",
    "--light--beige--glass": "rgba(255, 226, 203, 0.353)",
    "--beige--glass": "rgba(202, 162, 130, 0.874)",
    "--brown--glass": "rgba(140, 100, 73, 0.708)",
    "--light--brown": "#b08968",
    "--off--light--brown": "#b17f59",
    "--dark--light--brown": "#a87a55",
    "--brown": "#7f5239",
    "--beige--shadow": "rgb(179, 136, 87)",
    "--off--brown": "#6e452f",
    "--dull--dark--brown": "#5e402c",
    "--dark--brown": "#4a230f",
    "--dark--brown--glass": "#4a230fcf",
    "--off--dark--brown": "#411e0c",
  };

  // Loop through the default theme and reset the CSS variables
  Object.keys(defaultTheme).forEach((key) => {
    root.style.setProperty(key, defaultTheme[key]);
  });
};