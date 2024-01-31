const audio = {
  theme: new Howl({
    src: './audio/theme.wav',
    html5: true,
    volume: 0.02,
    loop: true,
  }),
  click: new Howl({
    src: './audio/click.wav',
    html5: true,
    volume: 0.1,
  }),
  hit: new Howl({
    src: './audio/dagger-woosh.wav',
    html5: true,
    volume: 0.1,
  }),
  miss: new Howl({
    src: './audio/fast-sword-whoosh.wav',
    html5: true,
    volume: 0.1,
  }),
};
