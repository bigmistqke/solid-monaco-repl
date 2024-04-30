import { onCleanup } from 'solid-js'
import { SetStoreFunction, createStore } from 'solid-js/store'
import { when } from '..'
import { CssFile, JsFile } from './file'

/**
 * Manages a registry of `Frame`s, each associated with its distinct `Window`. This class handles
 * the creation, retrieval, and management of `Frame` instances.
 *
 * @class FrameRegistry
 */
export class FrameRegistry {
  /**
   * A record of Frame instances indexed by a unique name identifier.
   * @private
   */
  private frames: Record<string, Frame>
  /**
   * A setter function to update the frames record.
   * @private
   */
  private set: SetStoreFunction<Record<string, Frame>>

  /**
   * Initializes a new instance of FrameRegistry.
   */
  constructor() {
    ;[this.frames, this.set] = createStore({})
  }

  /**
   * Adds a new frame to the registry with the given name and window object. Used internally by `Repl.Frame`
   *
   * @param name - The name to associate with the frame.
   * @param window - The window object of the frame.
   */
  add(name: string, window: Window) {
    this.set(name, new Frame(window))
  }

  /**
   * Deletes a frame from the registry by its name. Used internally by `Repl.Frame`.
   *
   * @param name - The name of the frame to delete.
   */
  delete(name: string) {
    this.set(name, undefined!)
  }

  /**
   * Retrieves a frame by its name.
   *
   * @param name - The name of the frame to retrieve.
   * @returns The frame associated with the given name, if it exists.
   */
  get(name: string) {
    return this.frames[name]
  }

  /**
   * Checks if a frame with the given name exists in the registry.
   *
   * @param {string} name - The name to check.
   * @returns {boolean} True if the frame exists, false otherwise.
   */
  has(name: string) {
    return name in this.frames
  }
}

/**
 * Represents an individual `<iframe/>` within the application.
 * It offers method to inject and execute Javascript and CSS code into its `Window`.
 *
 * @class Frame
 */
export class Frame {
  /**
   * Constructs a Frame instance associated with a given window.
   *
   * @param contentWindow - The window object associated with this frame.
   */
  constructor(
    /** The window object associated with this frame, typically an iframe's window. */
    public contentWindow: Window,
  ) {}

  injectModuleUrl(moduleUrl: string) {
    const script = this.contentWindow.document.createElement('script')
    script.type = 'module'
    script.src = moduleUrl
    this.contentWindow.document.head.appendChild(script)
    onCleanup(() => {
      // On cleanup we remove the script-tag
      this.contentWindow.document.head.removeChild(script)
      // And we dispose of the created module-url.
      URL.revokeObjectURL(moduleUrl)
    })
    return script
  }

  /**
   * Injects and executes the esm-module of the given `CssFile` or `JsFile` into the frame's window.
   * Returns the injected script-element.
   *
   * @param file - The file to inject, which could be a `CssFile` or `JsFile`.
   * @returns The script element that was injected.
   */
  injectFile(file: CssFile | JsFile) {
    // We need to generate a new module-url everytime we inject a file, to ensure the body is executed.
    return when(file.generateModuleUrl, this.injectModuleUrl.bind(this))
  }
}
