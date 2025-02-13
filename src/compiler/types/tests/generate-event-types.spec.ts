import type * as d from '../../../declarations';
import { generateEventTypes } from '../generate-event-types';
import * as StencilTypes from '../stencil-types';
import * as UtilHelpers from '../../../utils/helpers';
import * as Util from '../../../utils/util';
import { stubComponentCompilerMeta } from './ComponentCompilerMeta.stub';
import { stubComponentCompilerEvent } from './ComponentCompilerEvent.stub';
import { stubTypesImportData } from './TypesImportData.stub';

describe('generate-event-types', () => {
  describe('generateEventTypes', () => {
    let updateTypeIdentifierNamesSpy: jest.SpyInstance<
      ReturnType<typeof StencilTypes.updateTypeIdentifierNames>,
      Parameters<typeof StencilTypes.updateTypeIdentifierNames>
    >;
    let getTextDocsSpy: jest.SpyInstance<ReturnType<typeof Util.getTextDocs>, Parameters<typeof Util.getTextDocs>>;
    let toTitleCaseSpy: jest.SpyInstance<
      ReturnType<typeof UtilHelpers.toTitleCase>,
      Parameters<typeof UtilHelpers.toTitleCase>
    >;

    beforeEach(() => {
      updateTypeIdentifierNamesSpy = jest.spyOn(StencilTypes, 'updateTypeIdentifierNames');
      updateTypeIdentifierNamesSpy.mockImplementation(
        (
          _typeReferences: d.ComponentCompilerTypeReferences,
          _cmpMeta: d.ComponentCompilerMeta,
          _typeImportData: d.TypesImportData,
          initialType: string,
          _updateTypeName: (currentTypeName: string, typeAlias: d.TypesMemberNameData) => string
        ) => initialType
      );

      getTextDocsSpy = jest.spyOn(Util, 'getTextDocs');
      getTextDocsSpy.mockReturnValue('');

      toTitleCaseSpy = jest.spyOn(UtilHelpers, 'toTitleCase');
      toTitleCaseSpy.mockImplementation((_name: string) => 'MyEvent');
    });

    afterEach(() => {
      updateTypeIdentifierNamesSpy.mockRestore();
      getTextDocsSpy.mockRestore();
      toTitleCaseSpy.mockRestore();
    });

    it('returns an empty array when no events are provided', () => {
      const stubImportTypes = stubTypesImportData();
      const componentMeta = stubComponentCompilerMeta();

      expect(generateEventTypes(componentMeta, stubImportTypes)).toEqual([]);
    });

    it('prefixes the event name with "on"', () => {
      const stubImportTypes = stubTypesImportData();
      const componentMeta = stubComponentCompilerMeta({
        events: [stubComponentCompilerEvent()],
      });

      const actualTypeInfo = generateEventTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toHaveLength(1);
      expect(actualTypeInfo[0].name).toBe('onMyEvent');
    });

    it('derives a generic CustomEvent from the original type', () => {
      const stubImportTypes = stubTypesImportData();
      const componentMeta = stubComponentCompilerMeta({
        events: [stubComponentCompilerEvent()],
      });

      const actualTypeInfo = generateEventTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toHaveLength(1);
      expect(actualTypeInfo[0].type).toBe('(event: CustomEvent<UserImplementedEventType>) => void');
    });

    it('uses an updated type name to avoid naming collisions', () => {
      const updatedTypeName = 'SomeTypeReturned';
      updateTypeIdentifierNamesSpy.mockReturnValue(updatedTypeName);

      const stubImportTypes = stubTypesImportData();
      const componentMeta = stubComponentCompilerMeta({
        events: [stubComponentCompilerEvent()],
      });

      const actualTypeInfo = generateEventTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toHaveLength(1);
      expect(actualTypeInfo[0].type).toBe(`(event: CustomEvent<${updatedTypeName}>) => void`);
    });

    it('derives CustomEvent type when there is no original typing field', () => {
      const stubImportTypes = stubTypesImportData();
      const componentEvent = stubComponentCompilerEvent({
        complexType: {
          original: '',
          resolved: '',
          references: {},
        },
      });
      const componentMeta = stubComponentCompilerMeta({
        events: [componentEvent],
      });

      const actualTypeInfo = generateEventTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toHaveLength(1);
      expect(actualTypeInfo[0].type).toBe('CustomEvent');
    });

    it('returns the correct type info for a single event', () => {
      const componentMeta = stubComponentCompilerMeta({
        events: [stubComponentCompilerEvent()],
      });
      const stubImportTypes = stubTypesImportData();

      const expectedTypeInfo: d.TypeInfo = [
        {
          jsdoc: '',
          internal: false,
          name: 'onMyEvent',
          optional: false,
          required: false,
          type: '(event: CustomEvent<UserImplementedEventType>) => void',
        },
      ];

      const actualTypeInfo = generateEventTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toEqual(expectedTypeInfo);
    });

    it('returns the correct type info for multiple events', () => {
      toTitleCaseSpy.mockReturnValueOnce('MyEvent');
      toTitleCaseSpy.mockReturnValueOnce('AnotherEvent');

      const componentEvent1 = stubComponentCompilerEvent();
      const componentEvent2 = stubComponentCompilerEvent({
        internal: true,
        name: 'anotherEvent',
        method: 'anotherEvent',
        complexType: {
          original: '',
          resolved: '',
          references: {},
        },
      });
      const componentMeta = stubComponentCompilerMeta({
        events: [componentEvent1, componentEvent2],
      });
      const stubImportTypes = stubTypesImportData();

      const expectedTypeInfo: d.TypeInfo = [
        {
          jsdoc: '',
          internal: false,
          name: 'onMyEvent',
          optional: false,
          required: false,
          type: '(event: CustomEvent<UserImplementedEventType>) => void',
        },
        {
          jsdoc: '',
          internal: true,
          name: 'onAnotherEvent',
          optional: false,
          required: false,
          type: 'CustomEvent',
        },
      ];

      const actualTypeInfo = generateEventTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toEqual(expectedTypeInfo);
    });
  });
});
