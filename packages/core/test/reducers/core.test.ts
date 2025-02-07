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
import test from 'ava';
import type { ErrorObject } from 'ajv';
import {
  coreReducer,
  init,
  setSchema,
  update,
  updateCore,
  JsonFormsCore,
  getControlPath,
} from '../../src';
import type { JsonSchema } from '../../src';

import { cloneDeep } from 'lodash';

test('core reducer - previous state - init without options should keep previous objects', (t) => {
  const schema: JsonSchema = {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        const: 'bar',
      },
    },
  };
  const additionalErrors = [
    {
      instancePath: '',
      dataPath: '',
      schemaPath: '#/required',
      keyword: 'required',
      params: {
        missingProperty: 'foo',
      },
    },
  ];
  const after = coreReducer(
    {
      data: {},
      schema: {},
      uischema: {
        type: 'Label',
      },
      additionalErrors,
    },
    init({}, schema)
  );
  t.deepEqual(after.additionalErrors, additionalErrors);
});

test('core reducer - previous state - init with additionalErrors option object should overwrite additionalErrors', (t) => {
  const schema: JsonSchema = {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        const: 'bar',
      },
    },
  };

  const prevAdditionalErrors = [
    {
      instancePath: '',
      dataPath: '',
      schemaPath: '#/required',
      keyword: 'required',
      params: {
        missingProperty: 'foo',
      },
    },
  ];
  const currentAdditionalErrors = [
    {
      instancePath: '',
      dataPath: '',
      schemaPath: '#/required',
      keyword: 'required',
      params: {
        missingProperty: 'bar',
      },
    },
  ];
  const after = coreReducer(
    {
      data: {},
      schema: {},
      uischema: {
        type: 'Label',
      },
      additionalErrors: prevAdditionalErrors,
    },
    init({}, schema, undefined, { additionalErrors: currentAdditionalErrors })
  );
  t.deepEqual(after.additionalErrors, currentAdditionalErrors);
});

test('core reducer - previous state - init with empty options should not overwrite', (t) => {
  const schema: JsonSchema = {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        const: 'bar',
      },
    },
  };
  const additionalErrors = [
    {
      instancePath: '',
      dataPath: '',
      schemaPath: '#/required',
      keyword: 'required',
      params: {
        missingProperty: 'foo',
      },
    },
  ];
  const after = coreReducer(
    {
      data: {},
      schema: {},
      uischema: {
        type: 'Label',
      },
      additionalErrors,
    },
    init({}, schema, undefined, {})
  );
  t.deepEqual(after.additionalErrors, additionalErrors);
});

test('core reducer - previous state - init with undefined data should not change data', (t) => {
  const schema = {
    type: 'object',
    properties: {
      animal: {
        type: 'string',
      },
      color: {
        type: 'string',
      },
    },
  };

  const after = coreReducer(
    {
      data: undefined,
      schema: {},
      uischema: {
        type: 'Label',
      },
    },
    init(undefined, schema, undefined, {})
  );
  t.deepEqual(after.data, undefined);
});

test('core reducer - previous state - init schema with id', (t) => {
  const schema: JsonSchema = {
    $id: 'https://www.jsonforms.io/example.json',
    type: 'object',
    properties: {
      animal: {
        type: 'string',
      },
    },
  };
  const updatedSchema = cloneDeep(schema);
  updatedSchema.properties.animal.minLength = 5;

  const before: JsonFormsCore = coreReducer(
    undefined,
    init(undefined, schema, undefined, undefined)
  );

  const after: JsonFormsCore = coreReducer(
    before,
    init(undefined, updatedSchema, before.uischema, undefined)
  );
  t.is(after.schema.properties.animal.minLength, 5);
});

test('core reducer - update - undefined data should update for given path', (t) => {
  const schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
      },
    },
  };

  const before: JsonFormsCore = {
    data: undefined,
    schema: schema,
    uischema: {
      type: 'Label',
    },
  };

  const after = coreReducer(
    before,
    update('foo', (_) => {
      return 'bar';
    })
  );

  t.not(before, after);
  t.not(before.data, after.data);
  t.deepEqual(after, { ...before, data: { foo: 'bar' } });
});

test('core reducer - update - path is undefined state should remain same', (t) => {
  const before: JsonFormsCore = {
    data: {
      foo: 'bar',
      baz: {
        bar: 'bar',
      },
    },
    schema: {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          const: 'bar',
        },
      },
    },
    uischema: {
      type: 'Label',
    },
  };

  const after = coreReducer(
    before,
    update(undefined, (_) => {
      return { foo: 'anything' };
    })
  );

  t.is(before, after);
  t.is(before.data, after.data);
  t.is(before.data.baz, after.data.baz);
  t.deepEqual(before, after);
});

test('core reducer - update - path is null state should remain same', (t) => {
  const before: JsonFormsCore = {
    data: {
      foo: 'bar',
      baz: {
        bar: 'bar',
      },
    },
    schema: {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          const: 'bar',
        },
      },
    },
    uischema: {
      type: 'Label',
    },
  };

  const after = coreReducer(
    before,
    update(null, (_) => {
      return { foo: 'anything' };
    })
  );

  t.is(before, after);
  t.is(before.data, after.data);
  t.is(before.data.baz, after.data.baz);
  t.deepEqual(before, after);
});

test('core reducer - update - empty path should update root state', (t) => {
  const schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
      },
    },
  };

  const before: JsonFormsCore = {
    data: {
      foo: 'bar',
      baz: {
        bar: 'bar',
      },
    },
    schema,
    uischema: {
      type: 'Label',
    },
  };

  const after = coreReducer(
    before,
    update('', (_) => {
      return { foo: 'xyz' };
    })
  );

  t.not(before, after);
  t.not(before.data, after.data);
  t.deepEqual(after, { ...before, data: { foo: 'xyz' } });
});

test('core reducer - update - providing a path should update data only belonging to path', (t) => {
  const schema = {
    type: 'object',
    properties: {
      animal: {
        type: 'string',
      },
      color: {
        type: 'string',
      },
    },
  };

  const before: JsonFormsCore = {
    data: {
      animal: 'Sloth',
      color: 'Blue',
      baz: {
        bar: 'bar',
      },
    },
    schema,
    uischema: {
      type: 'Label',
    },
  };

  const after = coreReducer(
    before,
    update('color', (_) => {
      return 'Green';
    })
  );

  t.not(before, after);
  t.not(before.data, after.data);
  t.is(before.data.baz, after.data.baz);
  t.deepEqual(after, { ...before, data: { ...before.data, color: 'Green' } });
});

test('core reducer - update - should update errors', (t) => {
  const schema = {
    type: 'object',
    properties: {
      animal: {
        type: 'string',
      },
      color: {
        type: 'string',
        enum: ['Blue', 'Green'],
      },
    },
  };

  const before: JsonFormsCore = {
    data: {
      animal: 'Sloth',
      color: 'Blue',
    },
    schema,
    uischema: {
      type: 'Label',
    },
  };

  const after = coreReducer(
    before,
    update('color', (_) => {
      return 'Yellow';
    })
  );

  t.deepEqual(after, {
    ...before,
    data: { ...before.data, color: 'Yellow' },
    errors: [
      {
        instancePath: '/color',
        keyword: 'enum',
        message: 'must be equal to one of the allowed values',
        params: {
          allowedValues: ['Blue', 'Green'],
        },
        schemaPath: '#/properties/color/enum',
      },
    ],
  });
});

test('core reducer - update - setting a state slice as undefined should remove the slice', (t) => {
  const schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
      },
      fizz: {
        type: 'string',
      },
    },
  };

  const before: JsonFormsCore = {
    data: {
      foo: 'bar',
      fizz: 42,
    },
    schema: schema,
    uischema: {
      type: 'Label',
    },
  };

  const after = coreReducer(
    before,
    update('foo', (_) => {
      return undefined;
    })
  );

  t.not(before, after);
  t.not(before.data, after.data);
  t.deepEqual(Object.keys(after.data), ['fizz']);
});

test('core reducer - update core - state should be unchanged when nothing changes', (t) => {
  const schema = {
    type: 'object',
    properties: {
      animal: {
        type: 'string',
      },
    },
  };

  const data = {
    animal: 'dog',
  };
  const before: JsonFormsCore = coreReducer(undefined, init(data, schema));

  const after: JsonFormsCore = coreReducer(
    before,
    updateCore(before.data, before.schema, before.uischema)
  );
  t.true(before === after);
});

test('core reducer - update core - unchanged state properties should be unchanged when state changes', (t) => {
  const schema = {
    type: 'object',
    properties: {
      animal: {
        type: 'string',
      },
    },
  };

  const data = {
    animal: 'dog',
  };
  const before: JsonFormsCore = coreReducer(undefined, init(data, schema));

  const afterDataUpdate: JsonFormsCore = coreReducer(
    before,
    updateCore(
      {
        animal: 'cat',
      },
      before.schema,
      before.uischema,
      { additionalErrors: before.additionalErrors }
    )
  );
  t.true(before.schema === afterDataUpdate.schema);
  t.true(before.uischema === afterDataUpdate.uischema);
  t.true(before.additionalErrors === afterDataUpdate.additionalErrors);

  const updatedSchema = {
    type: 'object',
    properties: {
      animal: {
        type: 'string',
      },
      id: {
        type: 'number',
      },
    },
  };
  // check that data stays unchanged as well
  const afterSchemaUpdate: JsonFormsCore = coreReducer(
    before,
    updateCore(before.data, updatedSchema, before.uischema)
  );
  t.true(before.data === afterSchemaUpdate.data);
});

test('core reducer - update core - additionalErrors should update', (t) => {
  const schema = {
    type: 'object',
    properties: {
      animal: {
        type: 'string',
      },
    },
  };

  const data = {
    animal: 'dog',
  };
  const before: JsonFormsCore = coreReducer(
    undefined,
    init(data, schema, undefined, { additionalErrors: [] })
  );

  const additionalErrors = [
    {
      instancePath: '',
      dataPath: '',
      schemaPath: '#/required',
      keyword: 'required',
      params: {
        missingProperty: 'animal',
      },
    },
  ];
  const after: JsonFormsCore = coreReducer(
    before,
    updateCore(before.data, before.schema, before.uischema, {
      additionalErrors,
    })
  );
  t.true(after.additionalErrors === additionalErrors);
});

test('core reducer - setSchema - schema with id', (t) => {
  const schema: JsonSchema = {
    $id: 'https://www.jsonforms.io/example.json',
    type: 'object',
    properties: {
      animal: {
        type: 'string',
      },
    },
  };
  const updatedSchema = cloneDeep(schema);
  updatedSchema.properties.animal.minLength = 5;

  const before: JsonFormsCore = coreReducer(
    undefined,
    init(undefined, schema, undefined, undefined)
  );

  const after: JsonFormsCore = coreReducer(before, setSchema(updatedSchema));
  t.is(after.schema.properties.animal.minLength, 5);
});

test('core reducer helpers - getControlPath - converts JSON Pointer notation to dot notation', (t) => {
  const errorObject = { instancePath: '/group/name' } as ErrorObject;
  const controlPath = getControlPath(errorObject);
  t.is(controlPath, 'group.name');
});

test('core reducer helpers - getControlPath - fallback to AJV <=7 errors', (t) => {
  const errorObject = { dataPath: '/group/name' } as unknown as ErrorObject;
  const controlPath = getControlPath(errorObject);
  t.is(controlPath, 'group.name');
});

test('core reducer helpers - getControlPath - fallback to AJV <=7 errors does not crash for empty paths', (t) => {
  const errorObject = { dataPath: '' } as unknown as ErrorObject;
  const controlPath = getControlPath(errorObject);
  t.is(controlPath, '');
});

test('core reducer helpers - getControlPath - decodes JSON Pointer escape sequences', (t) => {
  const errorObject = { instancePath: '/~0group/~1name' } as ErrorObject;
  const controlPath = getControlPath(errorObject);
  t.is(controlPath, '~group./name');
});
