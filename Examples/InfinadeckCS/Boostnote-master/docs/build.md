# Build
This page is also available in [Japanese](https://github.com/BoostIO/Boostnote/blob/master/docs/jp/build.md), [Korean](https://github.com/BoostIO/Boostnote/blob/master/docs/ko/build.md), [Russain](https://github.com/BoostIO/Boostnote/blob/master/docs/ru/build.md), [Simplified Chinese](https://github.com/BoostIO/Boostnote/blob/master/docs/zh_CN/build.md), [French](https://github.com/BoostIO/Boostnote/blob/master/docs/fr/build.md) and [German](https://github.com/BoostIO/Boostnote/blob/master/docs/de/build.md).

## Environments

* npm: 6.x
* node: 8.x

## Development

We use Webpack HMR to develop Boostnote.
Running the following commands, at the top of the project directory, will start Boostnote with the default configurations.

Install the required packages using yarn.

```
$ yarn
```

Build and run.

```
$ yarn run dev
```

> ### Notice
> There are some cases where you have to refresh the app manually.
> 1. When editing a constructor method of a component
> 2. When adding a new css class (similar to 1: the CSS class is re-written by each component. This process occurs at the Constructor method.)

## Deploy

We use Grunt to automate deployment.
You can build the program by using `grunt`. However, we don't recommend this because the default task includes codesign and authenticode.

So, we've prepared a separate script which just makes an executable file.

```
grunt pre-build
```

You will find the executable in the `dist` directory. Note, the auto updater won't work because the app isn't signed.

If you find it necessary, you can use codesign or authenticode with this executable.

## Make own distribution packages (deb, rpm)

Distribution packages are created by exec `grunt build` on Linux platform (e.g. Ubuntu, Fedora).

> Note: You can create both `.deb` and `.rpm` in a single environment.

After installing the supported version of `node` and `npm`, install build dependency packages.


Ubuntu/Debian:

```
$ sudo apt-get install -y rpm fakeroot
```

Fedora:

```
$ sudo dnf install -y dpkg dpkg-dev rpm-build fakeroot
```

Then execute `grunt build`.

```
$ grunt build
```

You will find `.deb` and `.rpm` in the `dist` directory.
