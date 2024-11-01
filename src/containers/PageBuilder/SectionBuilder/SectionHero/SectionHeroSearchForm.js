
import React, { useEffect, useState } from 'react';
import { func, object, string } from 'prop-types';
import { Form as FinalForm, Field } from 'react-final-form';
import { useHistory } from 'react-router-dom';
import {
  Stack,
  Button,
  Divider,
  Autocomplete,
  TextField,
  FormControl,
  Box,
  useMediaQuery,
} from '@mui/material';
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
        <Autocomplete
          id="category-autocomplete"
          options={categories}
          getOptionLabel={option => option.name}
          value={categories.find(category => category.key === input.value) || null}
          onChange={(event, newValue) => {
            input.onChange(newValue ? newValue.key : '');
          }}
          renderInput={params => (
            <TextField
              {...params}
              // label={intl.formatMessage({ id: 'SectionHeroSearchForm.categoryPlaceholder' })}
              placeholder={intl.formatMessage({ id: 'SectionHeroSearchForm.categoryPlaceholder' })}
              variant="outlined"
              fullWidth
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.key}>
              {option.name}
            </li>
          )}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                border: "none",
              },
              "&:hover fieldset": {
                border: "none",
              },
              "&.Mui-focused fieldset": {
                border: "none",
              },
            },
          }}
          disableClearable
        />
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

  const supabaseContext = useSupabase();
  const { supabase } = supabaseContext || {};
  const [categories, setCategories] = useState([]);
  const history = useHistory();

  // Use useMediaQuery to detect if the screen width is less than or equal to 768px
  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('product_families').select('key, name');
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        // Sort categories alphabetically by 'name' property
        const sortedCategories = data.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(sortedCategories);
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

    let url = `/s?pub_categoryLevel1=${category}`;

    if (!isMobile && location && location.selectedPlace) {
      const address = location.selectedPlace.address;
      const bounds =
        location.selectedPlace.bounds.ne.lat +
        ',' +
        location.selectedPlace.bounds.ne.lng +
        ',' +
        location.selectedPlace.bounds.sw.lat +
        ',' +
        location.selectedPlace.bounds.sw.lng;

      url += `&address=${encodeURIComponent(address)}&bounds=${encodeURIComponent(bounds)}`;
    }

    history.push(url);
  };

  let searchInput = null;

  return (
    <FinalForm
      {...restOfProps}
      onSubmit={onSubmitForm}
      render={formRenderProps => {
        const { handleSubmit, values } = formRenderProps;
        const isFormValid =
          values.category && (isMobile || (values.location && values.location.selectedPlace));

        return (
          <Box style={{ backgroundColor: 'white', padding: 4, borderRadius: 50 }}>
            <form onSubmit={handleSubmit} className={css.searchForm}>
              <Stack direction="row" spacing={2} alignItems="center">
                {!isMobile && <LocationIcon style={{ marginLeft: 12 }} />}
                {!isMobile && (
                  <LocationSearchField
                    intl={intl}
                    inputRef={element => {
                      searchInput = element;
                    }}
                    onLocationChange={onChange}
                  />
                )}
                {!isMobile && (
                  <Divider
                    orientation="vertical"
                    variant="middle"
                    flexItem
                    style={{ marginTop: 6, marginBottom: 6 }}
                  />
                )}
                <CategorySelectField categories={categories} intl={intl} />
                <Button
                  variant="contained"
                  style={{
                    marginLeft: 10,
                    borderRadius: 100,
                    padding: 20,
                    backgroundColor: isFormValid ? '#FE9900' : '#B0B0B0',
                  }}
                  type="submit"
                  disabled={!isFormValid}
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
};

SectionHeroSearchFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  onSubmit: func.isRequired,
  appConfig: object.isRequired,
  intl: intlShape.isRequired,
};

const SectionHeroSearchForm = injectIntl(SectionHeroSearchFormComponent);

export default SectionHeroSearchForm;
