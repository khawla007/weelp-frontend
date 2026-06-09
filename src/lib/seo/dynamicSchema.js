import { generateSchema, getRecommendedSchemaType } from './schemaGenerator';

export const withGeneratedSchema = ({ itemType, seo = {}, values = {}, siteUrl } = {}) => {
  const schemaType = seo?.schema_type || getRecommendedSchemaType(itemType);

  return {
    ...(seo || {}),
    schema_type: schemaType,
    schema_data: generateSchema({
      itemType,
      schemaType,
      values,
      siteUrl,
    }),
  };
};
