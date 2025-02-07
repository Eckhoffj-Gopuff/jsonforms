/*
  The MIT License

  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/

import cloneDeep from 'lodash/cloneDeep';
import setFp from 'lodash/fp/set';
import unsetFp from 'lodash/fp/unset';
import get from 'lodash/get';
import {
  CoreActions,
  INIT,
  InitAction,
  InitActionOptions,
  SET_SCHEMA,
  SET_UISCHEMA,
  UPDATE_CORE,
  UPDATE_DATA,
  UpdateCoreAction,
} from '../actions';
import { JsonFormsCore, Reducer } from '../store';
import type { ErrorObject } from 'ajv';

export const initState: JsonFormsCore = {
  data: {},
  schema: {},
  uischema: undefined,
  additionalErrors: [],
};

const hasAdditionalErrorsOption = (
  option: any
): option is InitActionOptions => {
  if (option) {
    return option.additionalErrors !== undefined;
  }
  return false;
};

export const getAdditionalErrors = (
  state: JsonFormsCore,
  action?: InitAction | UpdateCoreAction
): ErrorObject[] => {
  if (action && hasAdditionalErrorsOption(action.options)) {
    return action.options.additionalErrors;
  }
  return state.additionalErrors;
};

export const coreReducer: Reducer<JsonFormsCore, CoreActions> = (
  state = initState,
  action
) => {
  switch (action.type) {
    case INIT: {
      const additionalErrors = getAdditionalErrors(state, action);

      return {
        ...state,
        data: action.data,
        schema: action.schema,
        uischema: action.uischema,
        additionalErrors,
      };
    }
    case UPDATE_CORE: {
      const additionalErrors = getAdditionalErrors(state, action);

      const stateChanged =
        state.data !== action.data ||
        state.schema !== action.schema ||
        state.uischema !== action.uischema ||
        state.additionalErrors !== additionalErrors;
      return stateChanged
        ? {
            ...state,
            data: action.data,
            schema: action.schema,
            uischema: action.uischema,
            additionalErrors,
          }
        : state;
    }
    case SET_SCHEMA: {
      return {
        ...state,
        schema: action.schema,
      };
    }
    case SET_UISCHEMA: {
      return {
        ...state,
        uischema: action.uischema,
      };
    }
    case UPDATE_DATA: {
      if (action.path === undefined || action.path === null) {
        return state;
      } else if (action.path === '') {
        // empty path is ok
        const result = action.updater(cloneDeep(state.data));
        return {
          ...state,
          data: result,
        };
      } else {
        const oldData: any = get(state.data, action.path);
        const newData = action.updater(cloneDeep(oldData));
        let newState: any;
        if (newData !== undefined) {
          newState = setFp(
            action.path,
            newData,
            state.data === undefined ? {} : state.data
          );
        } else {
          newState = unsetFp(
            action.path,
            state.data === undefined ? {} : state.data
          );
        }
        return {
          ...state,
          data: newState,
        };
      }
    }
    default:
      return state;
  }
};
