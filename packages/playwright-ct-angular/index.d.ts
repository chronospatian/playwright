/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Locator } from 'playwright/test';
import type { JsonObject } from '@playwright/experimental-ct-core/types/component';
import type { TestType } from '@playwright/experimental-ct-core';
import type { EnvironmentProviders, InputSignal, Provider, Signal, Type } from '@angular/core';

export type ComponentEvents = Record<string, Function>;

export interface MountOptions<HooksConfig extends JsonObject, Component> {
  props?: Partial<Component> | Record<string, unknown>, // TODO: filter props and handle signals
  on?: ComponentEvents;
  hooksConfig?: HooksConfig;
  imports?: (Type<any> | ReadonlyArray<any>)[]
  environmentProviders?: (EnvironmentProviders | Provider)[]
  providers?: Provider[]
  viewProviders?: Provider[]
}

type UnwrapSignalInputs<T> = {
  [key in keyof T]: T[key] extends InputSignal<infer R> ? R : T[key]
}

export interface MountResult<Component> extends Locator {
  unmount(): Promise<void>;
  update(options: {
    props?: Partial<UnwrapSignalInputs<Component>>,
    on?: Partial<ComponentEvents>,
  }): Promise<void>;
}

export const test: TestType<{
  mount<HooksConfig extends JsonObject, Component = unknown>(
    component: Type<Component> | string | StoryObject,
    options?: MountOptions<HooksConfig, Component>
  ): Promise<MountResult<Component>>;
}>;

export { defineConfig, PlaywrightTestConfig } from '@playwright/experimental-ct-core';
export { expect, devices } from 'playwright/test';

export interface StoryObject {
  template: string
  extends?: StoryObject[]
  props?: {
    [key: string]: any
  }
  on?: string[]
  imports?: any[]
  providers?: any[]
}
