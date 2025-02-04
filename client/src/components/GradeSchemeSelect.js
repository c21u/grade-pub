import React, { useState, useEffect } from "react";
import propTypes from "prop-types";
import { Alert } from "@instructure/ui-alerts";
import { Spinner } from "@instructure/ui-spinner";
import { View } from "@instructure/ui-view";
import { Select } from "@instructure/ui-select";

const GradeSchemeSelect = ({
  schemeUnset,
  gradeScheme,
  clickHandler,
  fetchOptions,
}) => {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState(
    gradeScheme?.title || options[0]?.title,
  );
  const [isShowingOptions, setIsShowingOptions] = useState(false);
  const [highlightedOptionId, setHighlightedOptionId] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(
    gradeScheme?.id || options[0]?.id,
  );

  const getOptionById = (queryId) => {
    return options.find(({ id }) => id.toString() === queryId);
  };

  const handleShowOptions = () => {
    setIsShowingOptions(true);
  };

  const handleHideOptions = () => {
    const option = getOptionById(selectedOptionId).title;
    setIsShowingOptions(false);
    setHighlightedOptionId(null);
    setSelectedOptionId(selectedOptionId ? option : "");
  };

  const handleBlur = () => {
    setHighlightedOptionId(null);
  };

  const handleHighlightOption = (event, { id }) => {
    event.persist();
    const option = getOptionById(id).title;
    setHighlightedOptionId(id);
    setInputValue(event.type === "keydown" ? option : inputValue);
  };

  const handleSelectOption = (event, { id }) => {
    const option = getOptionById(id);
    setSelectedOptionId(id);
    setInputValue(option.title);
    clickHandler(option);
    setIsShowingOptions(false);
  };

  useEffect(() => {
    if (fetchOptions?.headers?.Authorization) {
      window
        .fetch("/api/availableGradeSchemes", fetchOptions)
        .then(async (schemesResponse) => {
          try {
            setOptions(await schemesResponse.json());
          } catch (err) {
            console.error(err);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [fetchOptions]);

  if ((schemeUnset === null && gradeScheme === null) || options.length === 0) {
    return (
      <Spinner
        renderTitle="Loading grade scheme"
        size="x-small"
        margin="small"
      />
    );
  }

  if (!fetchOptions) {
    return null;
  }

  return (
    <View as="div" padding="large">
      {schemeUnset ? (
        <Alert variant="warning">
          This course currently has no grading scheme.
        </Alert>
      ) : gradeScheme.grading_scheme.reduce(
          (acc, cur) => acc && ["A", "B", "C", "D", "F"].includes(cur.name),
          true,
        ) ? (
        <Alert variant="success">
          This course is currently using the &quot;{gradeScheme.title}&quot;
          Grading Scheme.
        </Alert>
      ) : (
        <Alert variant="warning">
          This course is currently using the &quot;{gradeScheme.title}&quot;
          Grading Scheme, which contains grade codes that will not be accepted
          by Banner.
        </Alert>
      )}
      <Select
        renderLabel="Grade Scheme"
        assistiveText="Use arrow keys to navigate options."
        inputValue={inputValue}
        isShowingOptions={isShowingOptions}
        onBlur={handleBlur}
        onRequestShowOptions={handleShowOptions}
        onRequestHideOptions={handleHideOptions}
        onRequestHighlightOption={handleHighlightOption}
        onRequestSelectOption={handleSelectOption}
      >
        {options.map((option) => {
          return (
            <Select.Option
              id={option.id.toString()}
              key={option.id.toString()}
              isHighlighted={option.id.toString() === highlightedOptionId}
              isSelected={option.id.toString() === selectedOptionId}
            >
              {option.title}
            </Select.Option>
          );
        })}
      </Select>
      <hr />
    </View>
  );
};
GradeSchemeSelect.propTypes = {
  schemeUnset: propTypes.bool,
  gradeScheme: propTypes.object,
  clickHandler: propTypes.func,
  fetchOptions: propTypes.object,
};

export default GradeSchemeSelect;
