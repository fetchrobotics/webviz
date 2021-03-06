// @flow
//
//  Copyright (c) 2020-present, Cruise LLC
//
//  This source code is licensed under the Apache License, Version 2.0,
//  found in the LICENSE file in the root directory of this source tree.
//  You may not use this file except in compliance with the License.

import CheckboxBlankOutlineIcon from "@mdi/svg/svg/checkbox-blank-outline.svg";
import CheckboxMarkedIcon from "@mdi/svg/svg/checkbox-marked.svg";
import InformationIcon from "@mdi/svg/svg/information.svg";
import React from "react";

import { type TopicSettingsEditorProps } from ".";
import ColorPickerForTopicSettings from "./ColorPickerForTopicSettings";
import { SLabel, SInput } from "./common";
import Flex from "webviz-core/src/components/Flex";
import Icon from "webviz-core/src/components/Icon";
import { getGlobalHooks } from "webviz-core/src/loadWebviz";
import type { PoseStamped } from "webviz-core/src/types/Messages";
import { colors } from "webviz-core/src/util/sharedStyleConstants";

type PoseSettings = {|
  overrideColor?: ?string,
    alpha ?: number,
    size ?: {
      headLength: number,
      headWidth: number,
      shaftWidth: number,
      tipPoint: number,
      tailPoint: number,
    },
    modelType ?: "freight100-model" | "freight100-outline" | "freight500-model" | "freight1500-model" | "arrow",
    addCarOutlineBuffer ?: boolean,
|};

export default function PoseSettingsEditor(props: TopicSettingsEditorProps<PoseStamped, PoseSettings>) {
  const { message, settings, onFieldChange, onSettingsChange } = props;

  const settingsByCarType = React.useMemo(() => {
    switch (settings.modelType) {
      case "freight100-model":
      case "freight500-model":
      case "freight1500-model":
        {
          const alpha = settings.alpha != null ? settings.alpha : 1;
          return (
            <Flex col>
              <SLabel>Alpha</SLabel>
              <SInput
                type="number"
                value={alpha.toString()}
                min={0}
                max={1}
                step={0.1}
                onChange={(e) => onSettingsChange({ ...settings, alpha: parseFloat(e.target.value) })}
              />
            </Flex>
          );
        }
      case "freight100-outline": {
        return (
          <>
            <SLabel>Color of outline</SLabel>
            <ColorPickerForTopicSettings
              color={settings.overrideColor}
              onChange={(newColor) => onFieldChange("overrideColor", newColor)}
            />
          </>
        );
      }
      case "arrow":
      default: {
        const currentShaftWidth = settings.size?.shaftWidth ?? 2;
        const currentTipPoint = settings.size?.tipPoint ?? 3.82;
        const currentTailPoint = settings.size?.tailPoint ?? -0.88;
        const currentHeadWidth = settings.size?.headWidth ?? 2;
        const currentHeadLength = settings.size?.headLength ?? 0.1;
        return (
          <Flex col>
            <SLabel>Color</SLabel>
            <ColorPickerForTopicSettings
              color={settings.overrideColor}
              onChange={(newColor) => onFieldChange("overrideColor", newColor)}
            />
            <SLabel>Shaft width</SLabel>
            <SInput
              type="number"
              value={currentShaftWidth}
              placeholder="2"
              onChange={(e) =>
                onSettingsChange({ ...settings, size: { ...settings.size, shaftWidth: parseFloat(e.target.value) } })
              }
            />
            <SLabel>Tip Point</SLabel>
            <SInput
              type="number"
              value={currentTipPoint}
              placeholder="3.82"
              onChange={(e) =>
                onSettingsChange({ ...settings, size: { ...settings.size, tipPoint: parseFloat(e.target.value) } })
              }
            />
            <SLabel>Tail Point</SLabel>
            <SInput
              type="number"
              value={currentTailPoint}
              placeholder="-.88"
              onChange={(e) =>
                onSettingsChange({ ...settings, size: { ...settings.size, tailPoint: parseFloat(e.target.value) } })
              }
            />
            <SLabel>Head width</SLabel>
            <SInput
              type="number"
              value={currentHeadWidth}
              placeholder="2"
              onChange={(e) =>
                onSettingsChange({ ...settings, size: { ...settings.size, headWidth: parseFloat(e.target.value) } })
              }
            />
            <SLabel>Head length</SLabel>
            <SInput
              type="number"
              value={currentHeadLength}
              placeholder="0.1"
              onChange={(e) =>
                onSettingsChange({ ...settings, size: { ...settings.size, headLength: parseFloat(e.target.value) } })
              }
            />
          </Flex>
        );
      }
    }
  }, [onFieldChange, onSettingsChange, settings]);

  const badModelTypeSetting = React.useMemo(() => !["freight100-model", "freight100-outline", "freight500-model", "freight1500-model", "arrow"].includes(settings.modelType), [
    settings,
  ]);

  if (!message) {
    return (
      <div style={{ color: colors.TEXT_MUTED }}>
        <small>Waiting for messages...</small>
      </div>
    );
  }

  const CheckboxComponent = settings.addCarOutlineBuffer ? CheckboxMarkedIcon : CheckboxBlankOutlineIcon;

  const iconProps = {
    width: 16,
    height: 16,
    style: {
      fill: "currentColor",
      position: "relative",
      top: "5px",
    },
  };

  const copy = getGlobalHooks().perPanelHooks().ThreeDimensionalViz.copy.poseSettingsEditor;
  return (
    <Flex col>
      <SLabel>Rendered Car</SLabel>
      <div
        style={{ display: "flex", margin: "4px", flexDirection: "column" }}
        onChange={(e) => {
          onSettingsChange({ ...settings, modelType: e.target.value, alpha: undefined });
        }}>
        {[
          { value: "freight100-model", title: "Freight100 Model" },
          { value: "freight100-outline", title: "Freight100 Outline" },
          { value: "freight500-model", title: "Freight500 Model" },
          { value: "freight1500-model", title: "Freight1500 Model" },
          { value: "arrow", title: "Arrow" },
        ].map(({ value, title }) => (
          <div key={value} style={{ marginBottom: "4px", display: "flex" }}>
            <input
              type="radio"
              value={value}
              checked={settings.modelType === value || (value === "arrow" && badModelTypeSetting)}
            />
            <label>{title}</label>
          </div>
        ))}
      </div>

      <Flex style={{ marginBottom: "5px", cursor: "pointer" }}>
        <CheckboxComponent
          {...iconProps}
          onClick={() => onSettingsChange({ ...settings, addCarOutlineBuffer: !settings.addCarOutlineBuffer })}
        />
        <SLabel>Show error buffer</SLabel>
        {copy?.errorBuffer && (
          <Icon tooltip={copy.errorBuffer}>
            <InformationIcon />
          </Icon>
        )}
      </Flex>
      {settingsByCarType}
    </Flex>
  );
}

PoseSettingsEditor.canEditNamespaceOverrideColor = true;
