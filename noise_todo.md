---
title: AI Noise Suppression
description: Suppress hundreds of types of noise and reduce distortion for human voice
sidebar_position: 15
platform: web
exported_from: https://docs.agora.io/en/video-calling/advanced-features/ai-noise-suppression?platform=web
exported_on: '2025-10-19T10:37:39.644043Z'
exported_file: ai-noise-suppression_web.md
---

[HTML Version](https://docs.agora.io/en/video-calling/advanced-features/ai-noise-suppression?platform=web)

# AI Noise Suppression


AI Noise Suppression enables you to suppress hundreds of types of noise and reduce distortion in human voices when multiple people speak at the same time. In use-cases such as online meetings, online chat rooms, video consultations with doctors, and online gaming, AI Noise Suppression makes virtual communication as smooth as face-to-face interaction.

Try out the [online demo](https://webdemo-global.agora.io/index.html) for [AI noise suppression](https://webdemo-global.agora.io/example/plugin/aiDenoiser/index.html).

<a name="type"></a>
AI Noise Suppression reduces the following types of noise:

- Television
- Kitchen
- Street, such as birds chirping, traffic, and subway sounds
- Machine, such as fans, air conditioners, vacuum cleaners, and copiers
- Office, such as keyboard and mouse clicks
- Household, such as doors opening, creaking chairs, crying babies, and house renovations
- Constant knocking
- Beeps and clapping
- Music

You can choose following noise reduction strategies:
- Default: Reduces noise to a comfortable level without distorting human voice.
- Custom: A more enhanced or customized noise reduction strategy for your business use-case. Contact [support@agora.io](https://docs-md.agora.io/en/mailto:support@agora.io.md) for details.

Want to try out AI Noise Suppression? Use the <a href="https://webdemo.agora.io/aiDenoiser/index.html">online demo</a>.

## Understand the tech

In the pre-processing stage, AI Noise Suppression uses deep learning noise reduction algorithms to modify <audio src=""></audio> data in the extensions pipeline.

**AI noise suppression**

![](https://docs-md.agora.io/images/extensions-marketplace/ai-noise-suppression.svg)

## Prerequisites

Ensure that you have implemented the [SDK quickstart](https://docs-md.agora.io/en/video-calling/get-started/get-started-sdk.md) in your project.

## Enable AI Noise Suppression 

This section shows you how to integrate AI Noise Suppression into your app. 

1. Integrate AI Noise Suppression into your app

    To install the  AI Noise Suppression extension ([agora-extension-ai-denoiser](https://www.npmjs.com/package/agora-extension-ai-denoiser)), in the root of your project run the following command:

      `npm install agora-extension-ai-denoiser`

1. Import  AI Noise Suppression

    Add the following code to your `.js` file.

      ```javascript
      import {AIDenoiserExtension} from "agora-extension-ai-denoiser";
      ```

3. Dynamically load the Wasm  dependencies

    The AI Noise Suppression extension depends on a few Wasm files. To ensure that the browser can load and execute these files, do the following:

    1. Publish the files located in the `node_modules/agora-extension-ai-denoiser/external` directory to the CDN or static resource server, and put them under one public path. In subsequent steps, you need to pass in the public path URL to create an` AIDenoiserExtension` instance. The extension then dynamically loads these files.

        Note:
            - If the host URL of the Wasm files is not the same as that of the web application, enable the CORS policy.
            - Do not put the Wasm files in an HTTP service, loading HTTP resources in the HTTPS domain is blocked by the browsers' security policy.

    2. If you have enabled the Content Security Policy (CSP), because Wasm files are not allowed to load in Chrome and Edge by default, you need to configure the CSP as follows:

        - For versions later than Chrome 97 and Edge 97 (Chrome 97 and Edge 97 included): Add `'wasm-unsafe-eval'` and `blob:` in the [`script-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src) options. For example:
           ```xml
             <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'wasm-unsafe-eval' blob:">
             ```

        - For versions earlier than Chrome 97 and Edge 97: Add `'unsafe-eval'` and `blob:` in the `script-src` options.

4. Register the AI Noise Suppression extension

    Call <Link to= "{{global.API_REF_WEB_ROOT}}/interfaces/iagorartc.html#registerextensions">AgoraRTC.registerExtensions</Link>, and pass in the created `AIDenoiserExtension` instance. Optionally, listen for the callback reporting that the Wasm and JS files fail to load.

    ```typescript
    // Create an AIDenoiserExtension instance, and pass in the host URL of the Wasm files
    const denoiser = new AIDenoiserExtension({assetsPath:'./external'});
    // Check compatibility
    if (!denoiser.checkCompatibility()) {
     // The extension might not be supported in the current browser. You can stop executing further code logic
     console.error("Does not support AI Denoiser!");
    }
    // Register the extension
    AgoraRTC.registerExtensions([denoiser]);
    // (Optional) Listen for the callback reporting that the Wasm files fail to load
    denoiser.onloaderror = (e) => {
     // If the Wasm files fail to load, you can disable the extension, for example:
     // openDenoiserButton.enabled = false;
     console.log(e);
    }
    ```
    Best practice is to create one `AIDenoiserExtension` instance only.

5. Create an `IAIDenoiserProcessor` instance

    Call the `createProcessor` method to create a `processor`, and set whether to enable the extension by default. If you do not set the default state, the extension inherits the previous state.

    ```typescript
    // Create a processor
    const processor = denoiser.createProcessor();
    // Enable the extension by default
    processor.enable();
    // Disable the extension by default
    // processor.disable();
    ```

6. Inject the extension to the audio processing pipeline

    Call [pipe](https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/imicrophoneaudiotrack.html#pipe) and specify the [processorDestination](https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/imicrophoneaudiotrack.html#processordestination) property.

    ```typescript
    // Create a local video track
    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    // Inject the extension to the audio processing pipeline
    audioTrack.pipe(processor).pipe(audioTrack.processorDestination);
    await processor.enable();
    ```

7. Enable or disable the extension

    Call the `enable` or `disable` methods as needed.

      ```typescript
      () => {
        if (processor.enabled) {
          await processor.disable();
        } else {
          await processor.enable();
        }
      }
      ```
8. Set the noise suppression mode and level
   ```javascript
   // Listen for the callback reporting that the noise suppression process takes too long
   processor.onoverload = async (elapsedTime) => {
     console.log("overload!!!");
     // Switch from AI noise suppression to stationary noise suppression
     await processor.setMode("STATIONARY_NS");
     // Disable AI noise suppression
     await processor.disable();
   }
   ```

9. Dum audio

   Best practice for logging is to dump audio data. This significantly improves the efficiency of troubleshooting. To do this, call the `dump` method, and listen for the `ondump` and `ondumpend` callbacks.
   ```typescript
   processor.ondump = (blob, name) => {
     // Dump the audio data to a local folder in PCM format
     const objectURL = URL.createObjectURL(blob);
     const tag = document.createElement("a");
     tag.download = name;
     tag.href = objectURL;
     tag.click();
     setTimeout(() => {URL.revokeObjectURL(objectURL);}, 0);
   }

   processor.ondumpend = () => {
     console.log("dump ended!!");
   }

   processor.dump();
   ```

## Reference

This section completes the information on this page, or points you to documentation that explains other aspects about this product.

- For a working example, check out the [AI Denoiser web demo](https://webdemo.agora.io/aiDenoiser/index.html) and the associated [source code](https://github.com/AgoraIO/API-Examples-Web/tree/main/Demo/aiDenoiser).

### API reference

#### IAIDenoiserExtension

##### checkCompatibility

```typescript
checkCompatibility(): boolean;
```
**Since v1.1.0**.

Checks whether the AI Noise Suppression extension is supported on the current browser. The returned result is for reference only.

##### createProcessor

```typescript
createProcessor(): IAIDenoiserProcessor;
```

Creates an `IAIDenoiserProcessor` instance.

##### onloaderror

```typescript
onloaderror?: (error: Error) => void;
```

Reports when the Wasm files fail to load.

#### IAIDenoiserProcessor
##### kind

```typescript
get kind(): 'video' | 'audio';
```

The processor type, which is categorized as video or audio.

##### enabled

```typescript
get enabled(): boolean;
```

Whether the extension is enabled:
- true: The extension is enabled.
- false: The extension is disabled.

##### enable

```typescript
enable(): void | Promise<void>;
```

Enables the AI Noise Suppression extension.

##### disable

```typescript
disable(): void | Promise<void>;
```

Disables the AI Noise Suppression extension.

##### setMode

```typescript
setMode(mode: AIDenoiserProcessorMode): Promise<void>;
```

**Since v1.1.0**.

Sets the noise suppression mode.
	
When the resource consumption is high, call this method in the [onoverload](#onoverload) callback to switch to stationary noise suppression. See [AIDenoiserProcessorMode](#aidenoiserprocessormode) for details.

Call this method after [`pipe`](https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/imicrophoneaudiotrack.html#pipe).

##### setLevel

```typescript
setLevel(level: AIDenoiserProcessorLevel): Promise<void>;
```
**Since v1.1.0**.

Sets the intensity of AI noise suppression. See [AIDenoiserProcessorLevel](#aidenoiserprocessorlevel).

Call this method after [`pipe`](https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/imicrophoneaudiotrack.html#pipe).

##### dump

```typescript
dump(): void;
```

Dumps audio data in order to help troubleshoot noise reduction issues.

Call this method after [`pipe`](https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/imicrophoneaudiotrack.html#pipe).

Calling this method triggers the `ondump` callback nine times, returning nine WAV files (see the description below) for the audio data processed by the extension 30 seconds before and 60 seconds after the method call, then triggers the `ondumpend` callback to inform you that the audio data ends dumping.

**Audio file description**

Each audio file is encoded in PCM format and is 30 seconds long. The filename looks like `input_16000hz_1ch_0.pcm`, which contains the following information:

- The stage of the audio data:
   - input: Indicates the audio data is not processed yet.
   - ns_out: Indicates the audio data is processed by the noise reduction algorithm.
   - agc_out: Indicates the audio data is processed by the speech enhancement algorithm.
- The audio sampling rate.
- The number of audio channels.
- The time (T, seconds) when the audio data is dumped. The audio file contains data within the time range [T-30,T].

**Notes**

- If you disable the AI Noise Suppression extension before the `ondump` callback is triggered nine times, the dumping process ends immediately and the `ondumpend` callback is triggered. In this case, fewer than nine audio data files are returned.
- If the actual audio data processed by the extension is less than 30 seconds long, the returned audio file is less than 30 seconds long.

##### ondump

```typescript
ondump?: (blob: Blob, name: string) => void;
```

Reports that audio data is dumped.

This callback has the following parameters:

- `blob`: The audio data file.
- `name`: The `name `of the audio data file.

##### ondumpend

```typescript
ondumpend?: () => void;
```

Reports that audio data ends dumping.

##### onoverload

```typescript
onoverload?: (elapsedTime: number) => void;
```

Reports that the noise reduction process takes too long.

This callback has the following parameters:
- `elapsedTime`: The time (ms) the extension needs to process one audio frame. This value is for reference only, and the time precision depends on the browser. For example, the time precision is relatively low on Firefox.

#### Type definition

##### AIDenoiserExtensionOptions

```typescript
export interface AIDenoiserExtensionOptions {
  assetsPath: string
}
```

Options for initializing the AI Noise Suppression extension:
- `assetsPath`: The host URL of the .wasm files required by the AI Noise Suppression extension.

##### AIDenoiserProcessorMode

```typescript
export enum AIDenoiserProcessorMode {
  NSNG = "NSNG",
  STATIONARY_NS = "STATIONARY_NS",
}
```

The noise suppression mode:

- `NSNG`: AI noise suppression. This mode suppresses stationary and non-stationary noise described in [Noise types](#type).
- `STATIONARY_NS`: Stationary noise suppression. This mode suppresses stationary noise only. Agora recommends that you use this mode only when AI noise suppression takes too long.

##### AIDenoiserProcessorLevel

```typescript
export enum AIDenoiserProcessorLevel {
    SOFT = "SOFT",
    AGGRESSIVE = "AGGRESSIVE",
}
```

The intensity of AI noise suppression:
- `SOFT`: (Recommended) Light level of noise suppression.
- `AGGRESSIVE`: Medium level of noise suppression. At this level, the audio quality of human voices might be considerably affected.

### Considerations

Currently,  AI Noise Suppression has the following limitations:

- If the sample rate of the input signal is not 16 kHz,  AI Noise Suppression:
    1. Down-samples the signal to 16 kHz.
    1. Removes noise.
    1. Resamples the output signal to the original sample rate.

    This means that audio data above 8 kHz is removed in the output signal.

- In some use-cases, AI Noise Suppression may cause audio quality to decrease by a certain degree.
- When multiple people speak at the same time, the audio quality of lowest human voices could be decreased by a certain degree.

- If only some of the audio tracks on the current web page enable AI Noise Suppression, audio tracks that do not enable AI Noise Suppression could be affected. This is because AI Noise Suppression turns on AEC and AGC and turns off NS in the browser.
- Although AI Noise Suppression supports Safari v14.1 and greater, there are performance issues. Best practice is to not support Safari.
- AI Noise Suppression does not support browsers on mobile devices.
