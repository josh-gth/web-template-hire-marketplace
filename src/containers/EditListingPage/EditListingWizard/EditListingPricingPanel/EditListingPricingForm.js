import React, { useState, useEffect } from 'react';
import { bool, func, number, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

// Import configs and util modules
import appSettings from '../../../../config/settings';
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import * as validators from '../../../../util/validators';
import { formatMoney } from '../../../../util/currency';
import { types as sdkTypes } from '../../../../util/sdkLoader';

// Import shared components
import { Button, Form, FieldCurrencyInput, FieldTextInput } from '../../../../components';
import { Stack, Typography } from '@mui/material';
import { H3, H4, H5, H6, ListingLink } from '../../../../components';

// Import modules from this directory
import css from './EditListingPricingForm.module.css';

const { Money } = sdkTypes;

const getPriceValidators = (listingMinimumPriceSubUnits, marketplaceCurrency, intl) => {
  const priceRequiredMsgId = { id: 'EditListingPricingForm.priceRequired' };
  const priceRequiredMsg = intl.formatMessage(priceRequiredMsgId);
  const priceRequired = validators.required(priceRequiredMsg);

  const minPriceRaw = new Money(listingMinimumPriceSubUnits, marketplaceCurrency);
  const minPrice = formatMoney(intl, minPriceRaw);
  const priceTooLowMsgId = { id: 'EditListingPricingForm.priceTooLow' };
  const priceTooLowMsg = intl.formatMessage(priceTooLowMsgId, { minPrice });
  const minPriceRequired = validators.moneySubUnitAmountAtLeast(
    priceTooLowMsg,
    listingMinimumPriceSubUnits
  );

  return listingMinimumPriceSubUnits
    ? validators.composeValidators(priceRequired, minPriceRequired)
    : priceRequired;
};

export const EditListingPricingFormComponent = props => {
  const [initialValuesSet, setInitialValuesSet] = useState(false);

  // Initialize form with default values from props or current user
  const getInitialValues = () => {
    const { initialValues = {}, currentUser, weight } = props;
    const publicData = currentUser?.attributes?.profile?.publicData;
    
    if (publicData) {
      const defaultDeliveryRate = publicData.defaultDeliveryRate 
        ? new Money(publicData.defaultDeliveryRate * 100, props.marketplaceCurrency)
        : null;
      
      const defaultDeliveryPriceMinimum = publicData.defaultDeliveryPriceMinimum
        ? new Money(publicData.defaultDeliveryPriceMinimum * 100, props.marketplaceCurrency)
        : null;

      return {
        ...initialValues,
        deliveryPricePerKm: defaultDeliveryRate,
        deliveryPriceMinimum: defaultDeliveryPriceMinimum,
        deliveryWeight: weight || undefined,
      };
    }
    return { ...initialValues, deliveryWeight: weight || undefined };
  };

  return (
    <FinalForm
      {...props}
      initialValues={getInitialValues()}
      render={formRenderProps => {
        const {
          formId,
          autoFocus,
          className,
          disabled,
          ready,
          handleSubmit,
          marketplaceCurrency,
          unitType,
          listingMinimumPriceSubUnits,
          intl,
          invalid,
          pristine,
          saveActionMsg,
          updated,
          updateInProgress,
          fetchErrors,
          form: formApi,
          initialValues,
          currentUser,
          weight,
        } = formRenderProps;

        // useEffect to set initial values for discount fields
        useEffect(() => {
          console.log('=== Delivery Price Debug Logs ===');
          console.log('Initial values:', initialValues);
          console.log('Current user:', currentUser);
          
          if (currentUser?.attributes?.profile?.publicData) {
            const publicData = currentUser.attributes.profile.publicData;
            console.log('Public Data:', publicData);

            // Set discount fields
            [1, 2, 3, 4].forEach(level => {
              const thresholdField = `discountThreshold${level}`;
              const percentageField = `discountPercentage${level}`;

              if (!initialValues[thresholdField] && publicData[`discountDays${level}`]) {
                formApi.change(thresholdField, publicData[`discountDays${level}`]);
              }

              if (!initialValues[percentageField] && publicData[`discountPercentage${level}`]) {
                formApi.change(percentageField, publicData[`discountPercentage${level}`]);
              }
            });

            // Only update delivery prices if they're not already set
            const currentDeliveryRate = formApi.getState().values.deliveryPricePerKm;
            const currentDeliveryMin = formApi.getState().values.deliveryPriceMinimum;

            if (!currentDeliveryRate && publicData.defaultDeliveryRate) {
              const formattedDeliveryRate = new Money(publicData.defaultDeliveryRate * 100, marketplaceCurrency);
              formApi.change('deliveryPricePerKm', formattedDeliveryRate);
            }

            if (!currentDeliveryMin && publicData.defaultDeliveryPriceMinimum) {
              const formattedDeliveryPriceMinimum = new Money(publicData.defaultDeliveryPriceMinimum * 100, marketplaceCurrency);
              formApi.change('deliveryPriceMinimum', formattedDeliveryPriceMinimum);
            }
          }
        }, [currentUser, initialValues, formApi, marketplaceCurrency]);

        const priceValidators = getPriceValidators(
          listingMinimumPriceSubUnits,
          marketplaceCurrency,
          intl
        );

        //Ensures that the weight is a number, and contains no text


        // Validator to ensure fields are required
        const required = value => (value ? undefined : 'This field is required');

        const classes = classNames(css.root, className);
        const submitReady = (updated && pristine) || ready;
        const submitInProgress = updateInProgress;
        const submitDisabled = invalid || disabled || submitInProgress;
        const { updateListingError, showListingsError } = fetchErrors || {};

        return (
          <Form onSubmit={handleSubmit} className={classes}>
            {updateListingError ? (
              <p className={css.error}>
                <FormattedMessage id="EditListingPricingForm.updateFailed" />
              </p>
            ) : null}
            {showListingsError ? (
              <p className={css.error}>
                <FormattedMessage id="EditListingPricingForm.showListingFailed" />
              </p>
            ) : null}
            <FieldCurrencyInput
              id={`${formId}price`}
              name="price"
              className={css.input}
              autoFocus={autoFocus}
              label={intl.formatMessage(
                { id: 'EditListingPricingForm.pricePerProduct' },
                { unitType }
              )}
              placeholder={intl.formatMessage({ id: 'EditListingPricingForm.priceInputPlaceholder' })}
              currencyConfig={appSettings.getCurrencyFormatting(marketplaceCurrency)}
              validate={priceValidators}
            />
            {/* < button onClick={() => console.log(currentUser.attributes.profile.publicData)}>Log currentUser.attributes.profile.publicData</button> */}
            {/* Currency field for delivery price per 1000kg/km */}
            <FieldCurrencyInput
              id={`${formId}deliveryPricePerKm`}
              name="deliveryPricePerKm"
              className={css.input}
              label={intl.formatMessage(
                { id: 'EditListingPricingForm.deliveryPricePerKm' },
                { unitType }
              )}
              placeholder={intl.formatMessage({ id: 'EditListingPricingForm.deliveryPricePerKmPlaceholder' })}
              currencyConfig={appSettings.getCurrencyFormatting(marketplaceCurrency)}
              validate={required}
            />
            {/* Weight field for delivery price per 1000kg/km */}
            <FieldTextInput
              id={`${formId}deliveryWeight`}
              name="deliveryWeight"
              className={css.input}
              type="number"
              label={intl.formatMessage({ id: 'EditListingPricingForm.deliveryWeight' })}
              placeholder={intl.formatMessage({ id: 'EditListingPricingForm.deliveryWeightPlaceholder' })}
              validate={validators.composeValidators(validators.required('This field is required'), validators.number('Must be a number'))}
              disabled={disabled}
              value={weight}
            />
            {/* Currency field for Minimum Deliver Price */}
            <FieldCurrencyInput
              id={`${formId}deliveryPriceMinimum`}
              name="deliveryPriceMinimum"
              className={css.input}
              label={intl.formatMessage(
                { id: 'EditListingPricingForm.deliveryPriceMinimum' },
                { unitType }
              )}
              placeholder={intl.formatMessage({ id: 'EditListingPricingForm.deliveryPriceMinimumPlaceholder' })}
              currencyConfig={appSettings.getCurrencyFormatting(marketplaceCurrency)}
              validate={required}
            />

            <H3 as="h1">
              Duration Based Discounts
            </H3>

            {/* <Typography variant="h5" component="h2" className={css.discountHeader}>
              {`Duration Based Discounts`}
            </Typography> */}

            {[1, 2, 3, 4].map(level => (
              <div key={level} style={{ marginTop: '0px', marginBottom: '12px' }}>
                {/* <Typography variant="h6" component="h3" className={css.discountHeader}>
                  {`Discount Level ${level}`}
                </Typography> */}
                <H4 as="h5">
                  {`Discount Level ${level}`}
                </H4>
                <Stack direction="row" spacing={2} className={css.discountRow} style={{ width: '200px' }}>
                  <FieldTextInput
                    id={`${formId}discountThreshold${level}`}
                    name={`discountThreshold${level}`}
                    className={css.input}
                    label={intl.formatMessage({ id: `EditListingPricingForm.discountThreshold${level}` })}
                    type="number"
                    placeholder={intl.formatMessage({ id: 'EditListingPricingForm.discountThresholdPlaceholder' })}
                  />
                  <FieldTextInput
                    id={`${formId}discountPercentage${level}`}
                    name={`discountPercentage${level}`}
                    className={css.input}
                    label={intl.formatMessage({ id: `EditListingPricingForm.discountPercentage${level}` })}
                    type="number"
                    placeholder={intl.formatMessage({ id: 'EditListingPricingForm.discountPercentagePlaceholder' })}
                  />
                </Stack>
              </div>
            ))}
            {/* <button onClick={() => console.log('props:', props)}>Log props</button> */}
            <Button
              className={css.submitButton}
              type="submit"
              inProgress={submitInProgress}
              disabled={submitDisabled}
              ready={submitReady}
            >
              {saveActionMsg}
            </Button>
          </Form>
        );
      }}
    />
  );
};

EditListingPricingFormComponent.defaultProps = {
  fetchErrors: null,
  listingMinimumPriceSubUnits: 0,
  formId: 'EditListingPricingForm',
};

EditListingPricingFormComponent.propTypes = {
  formId: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  marketplaceCurrency: string.isRequired,
  unitType: string.isRequired,
  listingMinimumPriceSubUnits: number,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  currentUser: propTypes.currentUser,
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  weight: number,
};

export default compose(injectIntl)(EditListingPricingFormComponent);
