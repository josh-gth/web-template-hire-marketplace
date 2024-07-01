import React from 'react';
import { SCHEMA_TYPE_MULTI_ENUM, SCHEMA_TYPE_TEXT } from '../../util/types';
import {
  isFieldForCategory,
  pickCategoryFields,
  pickCustomFieldProps,
} from '../../util/fieldHelpers.js';
import SectionDetailsMaybe from './SectionDetailsMaybe';
import SectionMultiEnumMaybe from './SectionMultiEnumMaybe';
import SectionTextMaybe from './SectionTextMaybe';

/**
 * Renders custom listing fields.
 * - SectionDetailsMaybe is used if schemaType is 'enum', 'long', or 'boolean'
 * - SectionMultiEnumMaybe is used if schemaType is 'multi-enum'
 * - SectionTextMaybe is used if schemaType is 'text'
 *
 * @param {*} props include publicData, metadata, listingFieldConfigs, categoryConfiguration
 * @returns React.Fragment containing aforementioned components
 */
const CustomListingFields = props => {
  const { publicData, metadata, listingFieldConfigs, categoryConfiguration } = props;

  const { key: categoryPrefix, categories: listingCategoriesConfig } = categoryConfiguration;
  const categoriesObj = pickCategoryFields(publicData, categoryPrefix, 1, listingCategoriesConfig);
  const currentCategories = Object.values(categoriesObj);

  const isFieldForSelectedCategories = fieldConfig => {
    const isTargetCategory = isFieldForCategory(currentCategories, fieldConfig);
    return isTargetCategory;
  };

  const propsForCustomFields =
    pickCustomFieldProps(
      publicData,
      metadata,
      listingFieldConfigs,
      'listingType',
      isFieldForSelectedCategories
    ) || [];

  const shouldHideField = key => key === 'product_family' || key === 'product_id';

  return (
    <>
      {/* <button onClick={() => console.log('propsForCustomFields:', propsForCustomFields)}>Log propsForCustomFields</button> */}
      {/* <SectionDetailsMaybe {...props} isFieldForCategory={isFieldForSelectedCategories} /> */}
      {propsForCustomFields.map(customFieldProps => {
        const { schemaType, key, ...fieldProps } = customFieldProps;
        const value = fieldProps.scope === 'public' ? publicData[key] : fieldProps.scope === 'metadata' ? metadata[key] : null;
        const hasValue = value != null;

        if (shouldHideField(key)) {
          return null;
        }

        return schemaType === SCHEMA_TYPE_MULTI_ENUM ? (
          <SectionMultiEnumMaybe key={key} {...fieldProps} />
        ) : schemaType === SCHEMA_TYPE_TEXT && hasValue ? (
          <SectionTextMaybe key={key} {...fieldProps} text={value} />
        ) : null;
      })}
    </>
  );
};

export default CustomListingFields;
