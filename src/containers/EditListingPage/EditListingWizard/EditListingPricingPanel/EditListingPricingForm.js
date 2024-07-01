import React from 'react';
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

export const EditListingPricingFormComponent = props => (
  <FinalForm
    {...props}
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
      } = formRenderProps;

      const priceValidators = getPriceValidators(
        listingMinimumPriceSubUnits,
        marketplaceCurrency,
        intl
      );

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
          <FieldTextInput
            id={`${formId}discountThreshold1`}
            name="discountThreshold1"
            className={css.input}
            label={intl.formatMessage({ id: 'EditListingPricingForm.discountThreshold1' })}
            type="number"
            placeholder={intl.formatMessage({ id: 'EditListingPricingForm.discountThresholdPlaceholder' })}
          />
          <FieldTextInput
            id={`${formId}discountPercentage1`}
            name="discountPercentage1"
            className={css.input}
            label={intl.formatMessage({ id: 'EditListingPricingForm.discountPercentage1' })}
            type="number"
            placeholder={intl.formatMessage({ id: 'EditListingPricingForm.discountPercentagePlaceholder' })}
          />
          <FieldTextInput
            id={`${formId}discountThreshold2`}
            name="discountThreshold2"
            className={css.input}
            label={intl.formatMessage({ id: 'EditListingPricingForm.discountThreshold2' })}
            type="number"
            placeholder={intl.formatMessage({ id: 'EditListingPricingForm.discountThresholdPlaceholder' })}
          />
          <FieldTextInput
            id={`${formId}discountPercentage2`}
            name="discountPercentage2"
            className={css.input}
            label={intl.formatMessage({ id: 'EditListingPricingForm.discountPercentage2' })}
            type="number"
            placeholder={intl.formatMessage({ id: 'EditListingPricingForm.discountPercentagePlaceholder' })}
          />
          <FieldTextInput
            id={`${formId}discountThreshold3`}
            name="discountThreshold3"
            className={css.input}
            label={intl.formatMessage({ id: 'EditListingPricingForm.discountThreshold3' })}
            type="number"
            placeholder={intl.formatMessage({ id: 'EditListingPricingForm.discountThresholdPlaceholder' })}
          />
          <FieldTextInput
            id={`${formId}discountPercentage3`}
            name="discountPercentage3"
            className={css.input}
            label={intl.formatMessage({ id: 'EditListingPricingForm.discountPercentage3' })}
            type="number"
            placeholder={intl.formatMessage({ id: 'EditListingPricingForm.discountPercentagePlaceholder' })}
          />
          <FieldTextInput
            id={`${formId}discountThreshold4`}
            name="discountThreshold4"
            className={css.input}
            label={intl.formatMessage({ id: 'EditListingPricingForm.discountThreshold4' })}
            type="number"
            placeholder={intl.formatMessage({ id: 'EditListingPricingForm.discountThresholdPlaceholder' })}
          />
          <FieldTextInput
            id={`${formId}discountPercentage4`}
            name="discountPercentage4"
            className={css.input}
            label={intl.formatMessage({ id: 'EditListingPricingForm.discountPercentage4' })}
            type="number"
            placeholder={intl.formatMessage({ id: 'EditListingPricingForm.discountPercentagePlaceholder' })}
          />
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
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
};

export default compose(injectIntl)(EditListingPricingFormComponent);
