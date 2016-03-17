/**
 * vDDF API Client
 */
export default class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(method, api, body) {
    const apiUrl = `${this.baseUrl}/${api}`;

    let params = {
    };

    if (method === 'POST' || method === 'PUT') {
      params = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      };
    }

    const response = await fetch(apiUrl, params);
    const json = await response.json();

    if (json.error) {
      throw new Error(json.error);
    }

    return json.result;
  }
}

