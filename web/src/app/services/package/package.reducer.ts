import { Action, ActionReducer, createReducer, on } from '@ngrx/store';

import { calculateLimitedSpecInfo } from '../../helpers/calculate-limited-spec-info';
import { modelsCompletelyValid } from '../../helpers/models-completely-valid';
import * as EditorActions from '../editor/editor.actions';
import * as PackageActions from './package.actions';
import { LimitedSpecInfo, Credentials } from './types';
import { Error } from '../editor/types';

export interface PackageSaveState {
  loading: boolean;
  success: boolean | null;
}
export interface PackageSpecState {
  info: LimitedSpecInfo;
  beingEdited: boolean;
  value: string | null;
  valid: boolean | null;
}
export interface PackageCredentialsState {
  value: Credentials | null;
  success: boolean | null;
  loading: boolean;
}
export interface PackageState {
  spec: PackageSpecState;
  save: PackageSaveState;
  credentials: PackageCredentialsState;
  error: Error | null;
}

export const initialState: PackageState = {
  spec: {
    info: {},
    beingEdited: false,
    value: null,
    valid: null,
  },
  save: {
    loading: false,
    success: null,
  },
  credentials: {
    value: null,
    success: null,
    loading: false,
  },
  error: null,
};

const packageReducerValue = createReducer(
  initialState,
  on(EditorActions.stableSpecValueChange, (state, action) => ({
    ...state,
    spec: {
      ...state.spec,
      info: { ...state.spec.info, ...calculateLimitedSpecInfo(action.value) },
      value: action.value,
      beingEdited: false,
    },
  })),
  on(
    EditorActions.editorComponentSeedLoaded,
    EditorActions.editorComponentValueChange,
    (state) => ({
      ...state,
      spec: {
        ...state.spec,
        value: null,
        beingEdited: true,
        valid: null,
      },
    })
  ),
  on(EditorActions.editorApiSpecValidateManagedSuccess, (state, action) => ({
    ...state,
    spec: {
      ...state.spec,
      valid: modelsCompletelyValid(action.response),
    },
  })),
  on(PackageActions.saveComponentSaveClick, (state) => ({
    ...state,
    save: {
      ...state.save,
      loading: true,
      success: null,
    },
  })),
  on(PackageActions.packageApiSpecsSpecNamePutSuccess, (state) => ({
    ...state,
    save: {
      ...state.save,
      loading: false,
      success: true,
    },
  })),
  on(
    PackageActions.authNotLoggedIn,
    PackageActions.packageApiSpecsSpecNamePutError,
    (state, action) => ({
      ...state,
      save: {
        ...state.save,
        loading: false,
        success: false,
      },
      error: { ...state.error, message: action.message },
    })
  ),
  on(
    EditorActions.localStorageSeedLoaded,
    EditorActions.editorApiSeedGetSuccess,
    EditorActions.editorApiSeedsSeedGetSuccess,
    (state) => ({
      ...state,
      spec: {
        ...state.spec,
        info: {
          ...state.spec.info,
          actualName: null,
          id: null,
        },
      },
    })
  ),
  on(EditorActions.packageApiSpecsSpecNameGetSuccess, (state, action) => ({
    ...state,
    spec: {
      ...state.spec,
      info: {
        ...state.spec.info,
        actualName: action.response.name,
        id: action.response.id,
      },
    },
  })),
  on(EditorActions.routerNavigationEndSpecsId, (state) => ({
    ...state,
    credentials: {
      ...state.credentials,
      value: null,
      loading: true,
      success: null,
    },
  })),
  on(PackageActions.packageApiCredentialsGetSuccess, (state, action) => ({
    ...state,
    credentials: {
      ...state.credentials,
      value: action.credentials,
      loading: false,
      success: true,
    },
  })),
  on(PackageActions.packageApiCredentialsGetError, (state, action) => ({
    ...state,
    credentials: {
      ...state.credentials,
      loading: false,
      success: false,
    },
    error: {
      ...state.error,
      message: action.message,
    },
  }))
);

export function packageReducer(
  state: PackageState | undefined,
  action: Action
) {
  return packageReducerValue(state, action);
}
