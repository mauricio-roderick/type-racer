import checkPropTypes from 'check-prop-types';
import { createStore, applyMiddleware } from 'redux';
import { createMemoryHistory, createLocation } from 'history';
import { compile } from 'path-to-regexp';

import rootReducer from '../src/store/reducers';
import { middlewares } from '../src/store/configure';

export const storeFactory = (initialState) => {
  const createStoreWithMiddleWare = applyMiddleware(...middlewares)(createStore);
  return createStoreWithMiddleWare(rootReducer, initialState);
};

export const findByTestAttr = (wrapper, val) => {
  return wrapper.find(`[data-test="${val}"]`);
};

export const checkProps = (component, conformingProps) => {
  const propError = checkPropTypes(
    component.propTypes,
    conformingProps,
    'prop',
    component.name
  );
  expect(propError).toBeUndefined();
};

const generateUrl = (path, params) => {
  let templatePath = path;
  Object.keys(params).forEach(key => {
    const optionalParam = `:${key}?`;
    if (templatePath.find(`:${key}?`) > -1) {
      templatePath = templatePath.replace()
    }
    templatePath.replace()
  });
};

export const reactRouterProps = (path, params = {}, extendMatch = {}) => {
  const toPath = compile(path);
  const history = createMemoryHistory();
  const match = {
    url: toPath(params),
    path,
    params,
    isExact: false,
    ...extendMatch
  };
  const location = createLocation(match.url);

  return {
    match,
    history,
    location
  };
};