const BASE_URL = "http://localhost:4000";

async function request(path, method = "GET", body, headers = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API error");
  return data;
}

export const api = {
  get: (path, headers) => request(path, "GET", null, headers),
  post: (path, body, headers) => request(path, "POST", body, headers)
};
