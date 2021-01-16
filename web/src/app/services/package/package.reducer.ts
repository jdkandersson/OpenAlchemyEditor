import { Action, createReducer, on } from '@ngrx/store';

import { calculateLimitedSpecInfo } from '../../helpers/calculate-limited-spec-info';
import { modelsCompletelyValid } from '../../helpers/models-completely-valid';
import * as EditorActions from '../editor/editor.actions';
import { LimitedSpecInfo } from './types';

export interface PackageSpecState {
  info: LimitedSpecInfo;
  beingEdited: boolean;
  value: string | null;
  valid: boolean | null;
}
export interface PackageState {
  spec: PackageSpecState;
}

export const initialState: PackageState = {
  spec: {
    info: {},
    beingEdited: false,
    value: null,
    valid: null,
  },
};

const packageReducerValue = createReducer(
  initialState,
  on(EditorActions.stableSpecValueChange, (state, action) => ({
    ...state,
    spec: {
      ...state.spec,
      info: calculateLimitedSpecInfo(action.value),
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
  }))
);

export function packageReducer(
  state: PackageState | undefined,
  action: Action
) {
  return packageReducerValue(state, action);
}
