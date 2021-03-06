import { createAction, props } from '@ngrx/store';

import { Error } from '../editor/types';
import { SpecValue, SpecName, Credentials } from './types';

export const saveComponentSaveClick = createAction(
  '[save component] save click',
  props<{ value: SpecValue; name: SpecName }>()
);

export const authNotLoggedIn = createAction(
  '[auth] not logged in',
  props<Error>()
);

export const packageApiSpecsSpecNamePutSuccess = createAction(
  '[package API] /specs/{spec_name} PUT success',
  props<{ name: SpecName }>()
);
export const packageApiSpecsSpecNamePutError = createAction(
  '[package API] /specs/{spec_name} PUT error',
  props<Error>()
);

export const packageApiCredentialsGetSuccess = createAction(
  '[package api]  /credentials/default GET success',
  props<{ credentials: Credentials }>()
);
export const packageApiCredentialsGetError = createAction(
  '[package api]  /credentials/default GET error',
  props<Error>()
);

export const routerNavigationSpecsId = createAction(
  '[router] changed to specs/:id path'
);

export type Actions =
  | ReturnType<typeof saveComponentSaveClick>
  | ReturnType<typeof authNotLoggedIn>
  | ReturnType<typeof packageApiSpecsSpecNamePutSuccess>
  | ReturnType<typeof packageApiSpecsSpecNamePutError>
  | ReturnType<typeof routerNavigationSpecsId>;
