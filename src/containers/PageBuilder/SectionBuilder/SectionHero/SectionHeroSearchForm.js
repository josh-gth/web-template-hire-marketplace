import React, { useEffect, useState } from 'react';
import { bool, func, object, string } from 'prop-types';
import { Form as FinalForm, Field } from 'react-final-form';
import { useHistory } from 'react-router-dom';
import { Stack, IconButton, Select, MenuItem, InputLabel, FormControl, Box, Button, Divider } from '@mui/material';
import { Search as SearchIcon, LocationOn as LocationIcon } from '@mui/icons-material';

import { intlShape, injectIntl } from '../../../../util/reactIntl';
import { isMainSearchTypeKeywords } from '../../../../util/search';
import { useSupabase } from '../../../../supabase/SupabaseContext';
import { LocationAutocompleteInput } from '../../../../components';

import css from './SectionHeroSearchForm.module.css';

const identity = v => v;

const CategorySelectField = ({ categories, intl }) => (
  <Field
    name="category"
    render={({ input }) => (
      <FormControl fullWidth>
        {/* <InputLabel>{intl.formatMessage({ id: 'SectionHeroSearchForm.categoryPlaceholder' })}</InputLabel> */}
        <Select
          {...input}
          // label={intl.formatMessage({ id: 'SectionHeroSearchForm.categoryPlaceholder' })}
          style={{ width: '100%', border: 'none' }}
          inputProps={{ 'aria-label': 'Without label' }}
          variant="standard"
          displayEmpty
          disableUnderline
        >
          <MenuItem value="">
            <em>{intl.formatMessage({ id: 'SectionHeroSearchForm.categoryPlaceholder' })}</em>
          </MenuItem>
          {categories.map(category => (
            <MenuItem key={category.key} value={category.key}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )}
  />
);

const LocationSearchField = ({ intl, inputRef, onLocationChange }) => (
  <div style={{ width: '100%', border: 'none' }}>
    <Field
      name="location"
      format={identity}
      render={({ input, meta }) => {
        const { onChange, ...restInput } = input;

        const searchOnChange = value => {
          onChange(value);
          onLocationChange(value);
        };

        return (
          <LocationAutocompleteInput
            inputRef={inputRef}
            input={{ ...restInput, onChange: searchOnChange }}
            meta={meta}
            placeholder={intl.formatMessage({ id: 'SectionHeroSearchForm.locationPlaceholder' })}
            hideIcon={true}
          />
        );
      }}
    />
  </div>
);

const SectionHeroSearchFormComponent = props => {
  const { onSubmit, appConfig, intl, ...restOfProps } = props;
  const isKeywordsSearch = isMainSearchTypeKeywords(appConfig);

  const { supabase } = useSupabase();
  const [categories, setCategories] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('product_families')
        .select('key, name');
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data);
      }
    };
    fetchCategories();
  }, [supabase]);

  const onChange = location => {
    if (!isKeywordsSearch && location.selectedPlace) {
      onSubmit({ location });
      searchInput?.blur();
    }
  };

  const onSubmitForm = values => {
    const { category, location } = values;
    const address = location.selectedPlace.address;
    const bounds = location.selectedPlace.bounds.ne.lat + ',' + location.selectedPlace.bounds.ne.lng + ',' + location.selectedPlace.bounds.sw.lat + ',' + location.selectedPlace.bounds.sw.lng;

    const url = `/s?pub_categoryLevel1=${category}&address=${encodeURIComponent(address)}&bounds=${encodeURIComponent(bounds)}`;
    history.push(url);
  };

  let searchInput = null;

  return (
    <FinalForm
      {...restOfProps}
      onSubmit={onSubmitForm}
      render={formRenderProps => {
        const { handleSubmit, values } = formRenderProps;
        const isFormValid = values.category && values.location && values.location.selectedPlace;
        return (
          <Box style={{ backgroundColor: 'white', padding: 4, borderRadius: 50 }}>
            <form onSubmit={handleSubmit} className={css.searchForm}>
              <Stack direction="row" spacing={2} alignItems="center">
                <LocationIcon style={{ marginLeft: 12}}/>
                <LocationSearchField intl={intl} inputRef={element => { searchInput = element; }} onLocationChange={onChange} />
                <Divider orientation="vertical" variant="middle" flexItem style={{ marginTop: 6, marginBottom: 6 }} />
                <CategorySelectField categories={categories} intl={intl} />
                <Button
                  variant="contained"
                  style={{ marginLeft: 10, borderRadius: 100, padding: 20 }}
                  type="submit"
                  disabled={!isFormValid}
                  color={isFormValid ? 'primary' : 'grey'}
                >
                  <SearchIcon />
                </Button>
              </Stack>
            </form>
          </Box>
        );
      }}
    />
  );
};

SectionHeroSearchFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  isMobile: false,
};

SectionHeroSearchFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  onSubmit: func.isRequired,
  isMobile: bool,
  appConfig: object.isRequired,
  intl: intlShape.isRequired,
};

const SectionHeroSearchForm = injectIntl(SectionHeroSearchFormComponent);

export default SectionHeroSearchForm;
