/*
  The MIT License

  Copyright (c) 2017-2021 EclipseSource Munich
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
import React from 'react';
import {
  isBooleanControl,
  RankedTester,
  rankWith,
  ControlProps,
  optionIs,
  and,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { FormControl, FormControlLabel, FormHelperText } from '@mui/material';
import { MuiToggle } from '../mui-controls';

export const MaterialBooleanToggleControl = ({
  data,
  visible,
  label,
  id,
  enabled,
  uischema,
  handleChange,
  errors,
  path,
  config,
  description,
}: ControlProps) => {
  const descriptionIds = [];
  const helpId1 = `${id}-help1`;
  const helpId2 = `${id}-help2`;
  if (description) {
    descriptionIds.push(helpId1);
  }
  if (errors) {
    descriptionIds.push(helpId2);
  }
  const ariaDescribedBy = descriptionIds.join(' ');

  if (!visible) {
    return null;
  }

  return (
    <FormControl variant='standard'>
      <FormControlLabel
        label={label}
        id={id}
        control={
          <MuiToggle
            id={`${id}-input`}
            data={data}
            enabled={enabled}
            path={path}
            uischema={uischema}
            handleChange={handleChange}
            config={config}
            inputProps={{
              'aria-describedby': ariaDescribedBy,
            }}
          />
        }
      />
      {!!description && (
        <FormHelperText id={helpId1} error={false}>
          {description}
        </FormHelperText>
      )}
      {!!errors && (
        <FormHelperText id={helpId2} error={true}>
          {errors}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export const materialBooleanToggleControlTester: RankedTester = rankWith(
  3,
  and(isBooleanControl, optionIs('toggle', true))
);

export default withJsonFormsControlProps(MaterialBooleanToggleControl);
