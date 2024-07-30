import React from 'react';
import { bool, func, node, object, shape, string, arrayOf } from 'prop-types';
import classNames from 'classnames';

import Field, { hasDataInFields } from '../../Field';

import SectionContainer from '../SectionContainer';
import SectionHeroSearchForm from './SectionHeroSearchForm';
import css from './SectionHero.module.css';

const SectionHero = props => {
  const {
    sectionId,
    className,
    rootClassName,
    defaultClasses,
    title,
    description,
    appearance,
    callToAction,
    options,
    appConfig,
    onSubmit,
    isMobile,
  } = props;

  const fieldComponents = options?.fieldComponents;
  const fieldOptions = { fieldComponents };

  const hasHeaderFields = hasDataInFields([title, description, callToAction], fieldOptions);

  return (
    <SectionContainer
      id={sectionId}
      className={className}
      rootClassName={classNames(rootClassName || css.root)}
      appearance={appearance}
      options={fieldOptions}
    >
      {hasHeaderFields ? (
        <header className={defaultClasses.sectionDetails}>
          <Field data={title} className={defaultClasses.title} options={fieldOptions} />
          <Field data={description} className={defaultClasses.description} options={fieldOptions} />
          <SectionHeroSearchForm
            appConfig={appConfig}
            onSubmit={onSubmit}
            isMobile={isMobile}
          />
          <Field data={callToAction} className={defaultClasses.ctaButton} options={fieldOptions} />
        </header>
      ) : null}
    </SectionContainer>
  );
};

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
});

SectionHero.defaultProps = {
  className: null,
  rootClassName: null,
  defaultClasses: null,
  title: null,
  description: null,
  appearance: null,
  callToAction: null,
  isInsideContainer: false,
  options: null,
  appConfig: {},
  onSubmit: () => {},
  isMobile: false,
};

SectionHero.propTypes = {
  sectionId: string.isRequired,
  className: string,
  rootClassName: string,
  defaultClasses: shape({
    sectionDetails: string,
    title: string,
    description: string,
    ctaButton: string,
  }),
  title: object,
  description: object,
  appearance: object,
  callToAction: object,
  isInsideContainer: bool,
  options: propTypeOption,
  appConfig: object,
  onSubmit: func,
  isMobile: bool,
};

export default SectionHero;
