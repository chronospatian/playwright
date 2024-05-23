/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// @ts-check
// This file is injected into the registry as text, no dependencies are allowed.

/** @typedef {import('../playwright-ct-core/types/component').ObjectComponent} ObjectComponent */

import 'zone.js';
import { Component, EventEmitter, NgModule, reflectComponentType, isSignal } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting, } from '@angular/platform-browser-dynamic/testing';

/** @type {WeakMap<import('@angular/core/testing').ComponentFixture, Record<string, import('rxjs').Subscription>>} */
const __pwOutputSubscriptionRegistry = new WeakMap();

/** @type {Map<string, import('@angular/core/testing').ComponentFixture>} */
const __pwFixtureRegistry = new Map();

getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting(),
);

/**
 * @param {ObjectComponent & MountOptions} component
 * @param {boolean} isTemplate
 */
async function __pwConfigureComponent(component, isTemplate = false) {
  const componentMetadata = reflectComponentType(component.type);
  if (!componentMetadata?.isStandalone)
    throw new Error('Only standalone components are supported');

  TestBed.configureTestingModule({
    imports: [component.type],
  })

  if (component.environmentProviders) {
    TestBed.configureTestingModule({
      providers: component.environmentProviders
    })
  }

  if (component.imports && !isTemplate) {
    TestBed.configureTestingModule({
      imports: component.imports,
    })
  }

  if (component.providers) {
    TestBed.overrideComponent(component.type, {
      add: {
        providers: component.providers,
      }
    })
  }

  if (component.viewProviders) {
    TestBed.overrideComponent(component.type, {
      add: {
        viewProviders: component.viewProviders,
      }
    })
  }

  await TestBed.compileComponents();
}

/**
 * @param {ObjectComponent & MountOptions} component
 */
function __pwConfigureTemplate(component) {
  const inputs = Object.keys(component.props ?? {})
  const outputs = Object.keys(component.on ?? {})
  component.type = Component({
    standalone: true,
    imports: component.imports,
    template: component.type,
    inputs: inputs,
    outputs: outputs
  })(class WrapperComponent {
    constructor() {
      for (const output of outputs) {
        this[output] = new EventEmitter()
      }
    }
  })
}

/**
 * @param {ObjectComponent & MountOptions} component
 * @param {HTMLElement} rootElement
 */
function __pwRenderComponent(component, rootElement) {
  const fixture = TestBed.createComponent(component.type)

  rootElement.replaceChildren(fixture.nativeElement)
  document.body.replaceChildren(rootElement)

  __pwUpdateProps(fixture, component.props);
  __pwUpdateEvents(fixture, component.on);

  fixture.autoDetectChanges(true);

  return fixture;
}

/**
 * @param {import('@angular/core/testing').ComponentFixture} fixture
 */
function __pwUpdateProps(fixture, props = {}) {
  for (const [name, value] of Object.entries(props))
    fixture.componentRef.setInput(name, value);
}

/**
 * @param {import('@angular/core/testing').ComponentFixture} fixture
 */
function __pwUpdateEvents(fixture, events = {}) {
  const { outputs } = reflectComponentType(fixture.componentRef.componentType)
  const outputSubscriptionRecord =
    __pwOutputSubscriptionRegistry.get(fixture) ?? {};
  for (const { propName, templateName} of outputs) {
    const listener = events[templateName]
    if (!listener) {
      continue
    }
    /* Unsubscribe previous listener. */
    outputSubscriptionRecord[propName]?.unsubscribe();

    const subscription = fixture.componentInstance[
      propName
    ].subscribe((/** @type {unknown} */ event) => listener(event));

    /* Store new subscription. */
    outputSubscriptionRecord[propName] = subscription;
  }

  /* Update output subscription registry. */
  __pwOutputSubscriptionRegistry.set(fixture, outputSubscriptionRecord);
}


function __mergeStoryConfig(target) {
  target = {...target}
  for (let source of target.extends ?? []) {
    source = __mergeStoryConfig(source)
    target.imports = [source.imports ?? [], target.imports ?? []]
    target.providers = [source.providers ?? [], target.providers ?? []]
    target.on = Array.from(new Set([...source.on ?? [], ...target.on ?? []]))
    target.props = { ...source.props, ...target.props }
  }
  return target
}

async function __pwConfigureStory(component) {
  const { imports = [], providers, template, props = {}, on = [] } = __mergeStoryConfig(component.type)

  const TestModule = NgModule({
    providers,
  })(class TestModule {})

  const inputs = Object.keys(props)

  component.type = Component({
    standalone: true,
    imports: [TestModule, imports],
    template,
    inputs: inputs,
    outputs: on
  })(
    class TestStory {
      constructor() {
        for (const key of inputs) {
          if (isSignal(this[key])) {
            this[key].set(props[key])
          } else {
            Object.defineProperty(this, key, {
              value: props[key],
              enumerable: true,
              writable: true
            })
          }
        }
        for (const key of on) {
          if (Object.hasOwn(this, key)) continue
          Object.defineProperty(this, key, {
            value: new EventEmitter(),
            enumerable: true
          })
        }
      }
    })
}

window.playwrightMount = async (component, rootElement, hooksConfig) => {
  if (component.__pw_type === 'jsx')
    throw new Error('JSX mount notation is not supported');

  for (const hook of window.__pw_hooks_before_mount || [])
    await hook({ hooksConfig, TestBed });

  const isStory = typeof component.type === "object" && component.type !== null
  const isTemplate = typeof component.type === "string"

  if (isTemplate) {
    __pwConfigureTemplate(component)
  }

  if (isStory) {
    await __pwConfigureStory(component)
  }

  await __pwConfigureComponent(component, isTemplate)

  const fixture = __pwRenderComponent(component, rootElement);

  for (const hook of window.__pw_hooks_after_mount || [])
    await hook({ hooksConfig });

  __pwFixtureRegistry.set(rootElement.id, fixture);
};

window.playwrightUnmount = async rootElement => {
  const fixture = __pwFixtureRegistry.get(rootElement.id);
  if (!fixture)
    throw new Error('Component was not mounted');

  /* Unsubscribe from all outputs. */
  for (const subscription of Object.values(__pwOutputSubscriptionRegistry.get(fixture) ?? {}))
    subscription?.unsubscribe();
  __pwOutputSubscriptionRegistry.delete(fixture);

  fixture.destroy();
  fixture.nativeElement.replaceChildren();
};

window.playwrightUpdate = async (rootElement, component) => {
  if (component.__pw_type === 'jsx')
    throw new Error('JSX mount notation is not supported');

  const fixture = __pwFixtureRegistry.get(rootElement.id);
  if (!fixture)
    throw new Error('Component was not mounted');

  __pwUpdateProps(fixture, component.props);
  __pwUpdateEvents(fixture, component.on);

  fixture.detectChanges();
};
