<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=@bigmistqke/repl&background=tiles&project=%20" alt="@bigmistqke/repl">
</p>

# @bigmistqke/repl

`@bigmistqke/repl` provides unstyled building blocks to create TypeScript playgrounds utilizing the Monaco Editor. It supports a flexible file system for transpiling TypeScript into ECMAScript Modules (ESM), imports of external dependencies (including types), making it ideal for developers to create customizable, browser-based IDEs.

https://github.com/bigmistqke/repl/assets/10504064/50195cb6-f3aa-4dea-a40a-d04f2d32479d

**_Click [here](#example-overview) for a line-by-line explanation of the above example and [here](https://bigmistqke.github.io/repl/) for a live-demo._**

## Features

- **Monaco Editor Integration**
- **Comprehensive TypeScript Support**
- **Real-time Transpilation**: Direct transpilation of TypeScript code into ESM, allowing for immediate feedback.
- **Automatic Type Imports**: Streamline coding with automatic type discovery and imports of external dependencies.
- **Theme Flexibility**: Supports both dark and light themes, easily switchable to suit preferences.
- **Advanced File System Management**: Robust management of file states and operations within the editor.
- **Configurable Build and Runtime Options**: Easily configurable TypeScript compiler settings and other operational parameters.

# Table of Contents

- [Installation](#installation)
- [Components Documentation](#components-documentation)
  - [`Repl` Component](#repl-component)
  - [`Repl.Editor` Component](#repleditor-component)
  - [`Repl.Frame` Component](#replframe-component)
  - [`Repl.TabBar` Component](#repltabbar-component)
- [Hooks](#hooks)
  - [`useRepl`](#userepl)
- [Internal APIs Documentation](#internal-apis-documentation)
  - [`FileSystem`](#filesystem)
  - [`JsFile` and `CssFile`](#jsfile-and-cssfile)
  - [`FrameRegistry`](#frameregistry)
  - [`TypeRegistry`](#typeregistry)
- [Example Overview](#example-overview)
- [Acknowledgements](#acknowledgements)

## Installation

Import package from package manager.

```bash
npm install `@bigmistqke/repl`
yarn add `@bigmistqke/repl`
pnpm install `@bigmistqke/repl`
```

# Components Documentation

## `Repl` Component

The `Repl` component integrates the Monaco Editor into a SolidJS application, facilitating TypeScript editing and transpilation.

**Usage**

```tsx
<Repl
  typescript={{
    resolveJsonModule: true,
    esModuleInterop: true,
    ...
  }}
  initialState={{
    files: {
      'src/sum.ts': `export const sum = (a: number, b: number) => a + b`,
      'src/index.ts': `import { sum } from "./sum";
        export const sub = (a: number, b: number) => sum(a, b * -1)`,
    },
  }}
  class={styles.repl}
  onSetup={({ fs, frames }) => {
    createEffect(async () => {
      const moduleUrl = fs.get('src/index.ts')?.moduleUrl()
      if (!moduleUrl) return
      const { sub } = await import(moduleUrl)
      console.log(sub(2, 1)) // 1
    })
  }}
>
```

**Props**

- **babel**: Configuration for Babel transformations.
  - `presets`: Array of string identifiers for Babel presets.
  - `plugins`: Array of plugins or strings for Babel transformations.
- **cdn**: Cdn to import external dependencies from, defaults to `esm.sh`.
- **initialState**: Defines the initial state of the filesystem with predefined files and content.
  - `file`: Record of virtual path and source-code (`.js`/`.jsx`/`.ts`/`.tsx`/`.css`).
  - `alias`: Record of package-name and virtual path.
  - `types`:
    - `file`: Record of virtual path and source-code (`.d.ts`).
    - `alias`: Record of package-names and virtual path.
- **mode**: Theme mode for the editor ('light' or 'dark').
- **onSetup**: A function that runs after the editor setup is complete. It allows for custom initialization scripts, accessing filesystem and frame registry. The initial file-system state will only be processed after this callback returns. This callback can be async.
- **typescript**: Configuration options for the TypeScript compiler, equal to `tsconfig.json`.

**Type**

```tsx
type ReplProps = ComponentProps<'div'> &
  Partial<{
    babel: {
      presets: string[]
      plugins: (string | babel.PluginItem)[]
    }
    cdn: string
    initialState: {
      files: Record<string, string>
      alias: Record<string, string>
      types: {
        files: Record<string, string>
        alias: Record<string, string>
      }
    }
    mode: 'light' | 'dark'
    onSetup: (event: { fs: FileSystem; frames: FrameRegistry }) => Promise<void> | void
    typescript: TypescriptConfig
    actions?: {
      saveRepl?: boolean
    }
  }>
```

## `Repl.Editor` Component

A sub-component of `Repl` that represents an individual editor pane where users can edit files.

**Usage**

```tsx
<Repl.Editor
  style={{ flex: 1 }}
  path={currentPath()}
  onMount={editor => {
    createEffect(on(currentPath, () => editor.focus()))
  }}
/>
```

**Props**

- **path**: The file path in the virtual file system to bind the editor to.
- **onMount**: Callback function that executes when the editor is mounted.

**Type**

```tsx
type EditorProps = ComponentProps<'div'> & {
  path: string
  onMount?: (editor: MonacoEditor) => void
}
```

## `Repl.Frame` Component

Manages individual iframe containers for isolated execution environments.

**Usage**

```tsx
<Repl.Frame
  style={{ flex: 1 }}
  name="frame-2"
  bodyStyle={{
    padding: '0px',
    margin: '0px',
  }}
/>
```

**Props**

- **name**: An identifier for the frame, used in the frame registry. Defaults to `default`.
- **bodyStyle**: CSS properties as a string or JSX.CSSProperties object to apply to the iframe body.

**Type**

```tsx
type FrameProps = ComponentProps<'iframe'> &
  Partial<{
    name: string
    bodyStyle: JSX.CSSProperties | string
  }>
```

## `Repl.TabBar` Component

A minimal wrapper around `<For/>` to assist with navigating between different files opened in the editor.

**Usage**

```jsx
<Repl.TabBar style={{ flex: 1 }}>
  {({ path }) => <button onClick={() => setCurrentPath(path)}>{path}</button>}
</Repl.TabBar>
```

**Props**

- **children**: A callback with the `path` and the corresponding `File` as arguments. Expects a `JSX.Element` to be returned.
- **paths**: An array of strings to filter and sort existing paths.

**Type**

```tsx
type TabBarProps = ComponentProps<'div'> & {
  children: (arg: { path: string; file: File | undefined }) => JSXElement
  paths: string[]
}
```

# Hooks

## `useRepl`

Hook to interact with Repl's `FileSystem` and `FrameRegistry`.

**Usage**

```tsx
const { fs, frames } = useRepl()

const frame = frames.get('default')
const entry = fs.get('src/index.ts')

frame.injectFile(entry)
```

**Type**

```tsx
type useRepl = (): {
  fs: FileSystem,
  frames: FrameRegistry
}
```

# Internal APIs Documentation

## `FileSystem`

The `FileSystem` API manages a virtual file system, allowing for the creation, retrieval, and manipulation of files as well as handling imports and exports of modules within the monaco-editor environment.

**Key Methods and Properties**

- **create(path: string)**: Creates and returns a new `File` instance at the specified path.
- **get(path: string)**: Retrieves a `File` instance by its path.
- **has(path: string)**: Checks if a file exists at the specified path.
- **resolve(path: string)**: Resolves a path according to TypeScript resolution rules, supporting both relative and absolute paths.
- **addPackage(url: string)**: Adds a package by URL, analyzing and importing its contents into the virtual file system.
- **initialize()**: Initializes the file system with the specified initial state, including preloading files and setting aliases.

**Type**

```tsx
class FileSystem {
  constructor(
    public monaco: Monaco,
    config: ReplConfig,
  )

  alias: Record<string, string>
  config: ReplConfig
  packageJsonParser: PackageJsonParser
  typeRegistry: TypeRegistry

  initialize(): void
  toJSON(): {
    files: Record<string, string>
    alias: Record<string, string>
    types: {
      files: Record<string, string>
      alias: Record<string, string>
    }
  }
  download(name = 'repl.config.json') : void
  create(path: string): File
  has(path: string): boolean
  get(path: string): File | undefined
  addProject(files: Record<string, string>): void
  addPackage(url: string): Promise<void>
  resolve(path: string): File | undefined
  all(): Record<string, File>
}
```

## `JsFile` and `CssFile`

These classes represent JavaScript and CSS files within the virtual file system, respectively. Both extend from the abstract `File` class, which provides basic file operations and model management.

**Key Methods and Properties**

- **set(value: string)**: Sets the content of the file.
- **get()**: Retrieves the content of the file.
- **model**: The Monaco editor model associated with the file.
- **moduleUrl**: A URL to an esm-module of the transpiled content of the file.
- **toJSON()**: Serializes the file's content.

**Types**

```tsx
class JsFile extends File {
  model: Model
  set(value: string): void
  get(): string
  moduleUrl(): string | undefined
  cssImports: Accessor<CssFile[]>
  toJSON(): string
}

class CssFile extends File {
  model: Model
  set(value: string): void
  get(): string
  moduleUrl(): string | undefined
  toJSON(): string
}
```

## `FrameRegistry`

Manages `Frames`.

### Key Methods and Properties

- **add(name: string, window: Window)**: Adds a new frame with the given name and window reference.
- **get(name: string)**: Retrieves a frame by name.
- **has(name: string)**: Checks if a frame exists by name.
- **delete(name: string)**: Removes a frame from the registry.

```tsx
class FrameRegistry {
  add(name: string, window: Window): void
  get(name: string): Frame
  has(name: string): boolean
  delete(name: string): void
}
```

## `Frame`

Manages individual iframe containers used for isolated execution environments. This registry is used to manage and reference multiple frames, allowing files to be injected into specific frames.

### Key Methods and Properties

- **injectFile(file: JsFile | CssFile)**: Injects the moduleUrl of a given `JsFile | CssFile` into the frame

```tsx
class Frame {
  constructor(public window: Window)
  injectFile(file: CssFile | JsFile): HTMLScriptElement | undefined
}
```

## `TypeRegistry`

Handles the management and storage of TypeScript types across the application. Provides API to recursively collect fetch typescript-files from a given entry, either in the form of a url or a package-name.

**Key Methods and Properties**

- **importTypesFromUrl(url: string, packageName?: string)**: Imports types from a specified URL, optionally associating them with a package name.
- **importTypesFromPackageName(packageName: string)**: Imports types based on a package name, resolving to CDN paths and managing version conflicts.
- **toJSON()**: Serializes the current state of the registry for persistence or debugging.

**Types**

```tsx
export class TypeRegistry {
  constructor(public fs: FileSystem)

  importTypesFromUrl(url: string, packageName?: string): Promise<Void>
  importTypesFromPackageName(packageName: string): Promise<void>
  toJSON(): {
    files: Record<string, string>,
    types: Record<string, [string]>,
  }
}

```

# Example Overview

This application demonstrates complex interactions between various components and hooks, designed to facilitate an interactive and intuitive coding environment directly in the browser. Click [here](https://bigmistqke.github.io/repl/) for a live-demo.

### Detailed Code Explanation

```tsx
import { Repl, useRepl } from '@bigmistqke/repl'
import { solidReplPlugin } from '@bigmistqke/repl/plugins/solid-repl'
import { Resizable } from 'corvu/resizable'
import { createEffect, createSignal, mapArray, on, onCleanup } from 'solid-js'
import { JsFile } from 'src/logic/file'
import { JsxEmit } from 'typescript'

// Main component defining the application structure
const App = () => {
  // State management for the current file path, initialized to 'src/index.tsx'
  const [currentPath, setCurrentPath] = createSignal('src/index.tsx')

  // Button component for adding new files dynamically to the REPL environment
  const AddButton = () => {
    const repl = useRepl() // Access the REPL context for filesystem operations

    return (
      <button
        onClick={() => {
          let index = 1
          let path = `src/index.tsx`
          // Check for existing files and increment index to avoid naming collisions
          while (repl.fs.has(path)) {
            path = `src/index${index}.tsx`
            index++
          }
          // Create a new file in the file system and set it as the current file
          repl.fs.create(path)
          setCurrentPath(path)
        }}
      >
        add file
      </button>
    )
  }

  // Setting up the editor with configurations for Babel and TypeScript
  return (
    <Repl
      babel={{
        presets: ['babel-preset-solid'], // Babel preset for SolidJS
        plugins: [solidReplPlugin], // Plugin to enhance SolidJS support in Babel
      }}
      typescript={{
        resolveJsonModule: true,
        esModuleInterop: true,
        noEmit: true, // Avoid emitting files during compilation
        isolatedModules: true, // Ensures each file can be transpiled independently
        skipLibCheck: true, // Skip type checking of all declaration files (*.d.ts)
        allowSyntheticDefaultImports: true,
        forceConsistentCasingInFileNames: true,
        noUncheckedIndexedAccess: true,
        paths: {}, // Additional paths for module resolution
        jsx: JsxEmit.Preserve, // Preserve JSX to be handled by another transformer (e.g., Babel)
        jsxImportSource: 'solid-js', // Specify the JSX factory functions import source
        strict: true, // Enable all strict type-checking options
      }}
      initialState={{
        files: {
          'src/index.css': `body { background: blue; }`, // Initial CSS content
          'src/index.tsx': `...JSX code...`, // Initial JS/JSX content
        },
      }}
      class={styles.repl} // CSS class for styling the REPL component
      onSetup={async ({ fs, frames }) => {
        createEffect(() => {
          const frame = frames.get('default') // Access the default frame
          if (!frame) return

          const entry = fs.get(currentPath()) // Get the current main file
          if (entry instanceof JsFile) {
            frame.injectFile(entry) // Inject the JS file into the iframe for execution

            // Cleanup action to remove injected scripts on component unmount
            onCleanup(() => frame.window.dispose?.())

            // Process CSS imports and inject them into the iframe
            createEffect(
              mapArray(entry.cssImports, css => createEffect(() => frame.injectFile(css))),
            )
          }
        })
        // Optional: Load external packages dynamically
        /* await fs.addPackage('./solid-three') */
      }}
    >
      <Resizable style={{ width: '100vw', height: '100vh', display: 'flex' }}>
        <Resizable.Panel style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex' }}>
            <Repl.TabBar style={{ flex: 1 }}>
              {({ path }) => <button onClick={() => setCurrentPath(path)}>{path}</button>}
            </Repl.TabBar>
            <AddButton />
          </div>
          <Repl.Editor
            style={{ flex: 1 }}
            path={currentPath()}
            onMount={editor => {
              // Focus the editor on mount and whenever the current file path changes
              createEffect(on(currentPath, () => editor.focus()))
            }}
          />
        </Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel style={{ display: 'flex' }}>
          <Repl.Frame
            style={{ flex: 1 }}
            bodyStyle={{ padding: '0px', margin: '0px' }} // Style for the iframe body
          />
        </Resizable.Panel>
      </Resizable>
    </Repl>
  )
}

export default App
```

# Acknowledgements

The main inspiration of this project is my personal favorite IDE: [solid-playground](https://github.com/solidjs/solid-playground). Some LOC are copied directly, p.ex the css- and js-injection into the iframe.