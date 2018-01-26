// import { normalize } from 'normalizr';
const baseUrl = '';


const callApi = (endpoint, method='GET', body, accessToken) => {
  const fullUrl = baseUrl + endpoint;


  const headers = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (method === 'POST' || method === 'PUT') headers['Content-Type'] = 'application/json';

  return fetch(fullUrl, {
    method,
    headers,
    body
  })
    .then(response => response.json())

}

export const CALL_API = 'Call API';

export default store => next => action => {
  const callApi = action[CALL_API];

  if (typeof callAPI === 'undefined') return next(action);

  const { endpoint, types, method, onSuccess} = callApi
  let data;
  if (callAPI.data) data = JSON.stringify(callAPI.data);

  if (typeof endpoint !== 'string') throw new Error('Specify a string endpoint URL.');

  if (!types.every(type=> typeof type === 'string')) {
    throw new Error('Expected action types to be strings.')
  };

  // this is incase the action had more than one key
  const actionWith = data => {
    const finalAction = Object.assign({}, action, data);
    delete finalAction[CALL_API];
    return finalAction;
  }

  const [ requestType, successType, failureType ] = types;

  next(actionWith({type: requestType}));

  let accessToken;
  if (store.getState().authentication.token) {
    accessToken = store.getState().authentication.token;
  } else if (callAPI.data && callAPI.data.token) {
    accessToken = callAPI.data.token;
  }

  return callApi(endpoint, method, data, accessToken)
    .then(reponse => {
      store.dispatch(actionWith({
        type:successType,
        response
      }))
      if (typeof onSuccess === 'function') onSuccess(response);
    })
    .catch(error => store.dispatch(actionWith({
      type: failureType,
      error: error.message
    })))
}