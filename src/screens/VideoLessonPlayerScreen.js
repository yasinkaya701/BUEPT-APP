import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking, ScrollView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography } from '../theme/tokens';

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function formatClock(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

function buildVideoHtml({ title, videoUrl, posterUrl }) {
  const safeTitle = (title || 'Lesson Video').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeVideo = videoUrl || '';
  const safePoster = posterUrl || '';

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; background: #0b1020; color: #dbeafe; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .wrap { padding: 16px; }
      .title { font-size: 18px; font-weight: 700; margin: 0 0 10px 0; }
      video { width: 100%; border-radius: 12px; background: #000; }
      .note { font-size: 12px; color: #93c5fd; margin-top: 8px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <p class="title">${safeTitle}</p>
      <video id="player" controls playsinline preload="metadata" poster="${safePoster}">
        <source src="${safeVideo}" type="video/mp4" />
      </video>
      <p class="note">If playback is blocked by network policy, use "Open Externally".</p>
    </div>
  </body>
</html>`;
}

function makePlayerScript(code) {
  return `
    (function(){
      var video = document.getElementById('player');
      if (!video) return;
      ${code}
    })();
    true;
  `;
}

function sceneStartSec(scenes, idx) {
  let total = 0;
  for (let i = 0; i < idx; i += 1) total += Number(scenes[i]?.durationSec || 0);
  return total;
}

function chapterFromTime(scenes, sec) {
  if (!scenes.length) return 0;
  let acc = 0;
  for (let i = 0; i < scenes.length; i += 1) {
    acc += Number(scenes[i]?.durationSec || 0);
    if (sec < acc) return i;
  }
  return scenes.length - 1;
}

const BRIDGE_JS = `
(function(){
  var video = document.getElementById('player');
  if (!video || window.__RN_BRIDGE_READY__) return;
  window.__RN_BRIDGE_READY__ = true;

  var lastPush = 0;
  function push(type){
    try {
      var now = Date.now();
      if (type === 'timeupdate' && now - lastPush < 300) return;
      if (type === 'timeupdate') lastPush = now;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: type,
        currentTime: Number(video.currentTime || 0),
        duration: Number(video.duration || 0),
        paused: !!video.paused,
        muted: !!video.muted,
        playbackRate: Number(video.playbackRate || 1)
      }));
    } catch(e){}
  }

  ['loadedmetadata','timeupdate','play','pause','ended','ratechange','volumechange'].forEach(function(evt){
    video.addEventListener(evt, function(){ push(evt); });
  });
  push('init');
})();
true;
`;

export default function VideoLessonPlayerScreen({ route, navigation }) {
  const webRef = useRef(null);
  const [speed, setSpeed] = useState(1);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef(null);
  const isWeb = Platform.OS === 'web';

  const title = route?.params?.title || 'Lesson Video';
  const videoUrl = route?.params?.videoUrl || '';
  const posterUrl = route?.params?.posterUrl || '';
  const provider = route?.params?.provider || '';
  const scenes = Array.isArray(route?.params?.scenes) ? route.params.scenes : [];

  const valid = isHttpUrl(videoUrl);
  const html = useMemo(() => buildVideoHtml({ title, videoUrl, posterUrl }), [title, videoUrl, posterUrl]);
  const totalProgress = durationSec > 0 ? Math.max(0, Math.min(100, (currentSec / durationSec) * 100)) : 0;
  const activeChapter = chapterFromTime(scenes, currentSec);
  const activeScene = scenes[activeChapter] || null;

  const inject = (code) => {
    if (isWeb) {
      const video = videoRef.current;
      if (!video) return;
      // Simple evaluator for the code strings used elsewhere
      if (code.includes('playbackRate')) {
        const rate = parseFloat(code.split('=')[1]);
        video.playbackRate = rate;
      } else if (code.includes('currentTime')) {
        if (code.includes('Math.max')) {
           // seekBy logic
           const delta = parseFloat(code.match(/\(([-+]?\d+)\)/)[1]);
           video.currentTime = Math.max(0, video.currentTime + delta);
        } else {
           // jumpToScene logic
           const target = parseFloat(code.match(/currentTime = (\d+)/)[1]);
           video.currentTime = target;
        }
      } else if (code.includes('paused')) {
        if (video.paused) video.play(); else video.pause();
      } else if (code.includes('muted')) {
        video.muted = !video.muted;
      }
      return;
    }
    if (!webRef.current) return;
    webRef.current.injectJavaScript(makePlayerScript(code));
  };

  const setPlaybackRate = (nextRate) => {
    setSpeed(nextRate);
    inject(`video.playbackRate = ${nextRate};`);
  };

  const seekBy = (deltaSec) => {
    inject(`video.currentTime = Math.max(0, (video.currentTime || 0) + (${deltaSec}));`);
  };

  const togglePlayPause = () => {
    inject('if(video.paused){video.play();}else{video.pause();}');
  };

  const toggleMute = () => {
    inject('video.muted = !video.muted;');
  };

  const jumpToScene = (index) => {
    const target = sceneStartSec(scenes, index);
    inject(`video.currentTime = ${target}; video.play();`);
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event?.nativeEvent?.data || '{}');
      if (typeof data.currentTime === 'number') setCurrentSec(data.currentTime);
      if (typeof data.duration === 'number' && data.duration > 0) setDurationSec(data.duration);
      if (typeof data.paused === 'boolean') setPaused(data.paused);
      if (typeof data.muted === 'boolean') setMuted(data.muted);
      if (typeof data.playbackRate === 'number') setSpeed(data.playbackRate);
    } catch (_) {
      // ignore malformed bridge messages
    }
  };

  // Web sync
  useEffect(() => {
    if (!isWeb || !videoRef.current) return;
    const v = videoRef.current;
    const onTimeUpdate = () => setCurrentSec(v.currentTime);
    const onLoadedMetadata = () => setDurationSec(v.duration);
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    const onRateChange = () => setSpeed(v.playbackRate);
    const onVolumeChange = () => setMuted(v.muted);

    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('loadedmetadata', onLoadedMetadata);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ratechange', onRateChange);
    v.addEventListener('volumechange', onVolumeChange);

    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ratechange', onRateChange);
      v.removeEventListener('volumechange', onVolumeChange);
    };
  }, [isWeb]);

  if (!valid) {
    return (
      <Screen scroll contentStyle={styles.container}>
        <Card>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.error}>Video URL is missing or invalid.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>
        </Card>
      </Screen>
    );
  }

  return (
    <View style={styles.fullscreen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerBody}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          {provider ? <Text style={styles.headerSub} numberOfLines={1}>{provider}</Text> : null}
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => Linking.openURL(videoUrl)}>
          <Ionicons name="open-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.playerArea}>
        {isWeb ? (
          <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '8px 16px', color: '#dbeafe', fontSize: '14px', background: 'rgba(0,0,0,0.4)', fontWeight: '700' }}>
              {title}
            </div>
            <video
              ref={videoRef}
              src={videoUrl}
              poster={posterUrl}
              controls
              playsInline
              style={{ flex: 1, width: '100%', outline: 'none' }}
            />
          </div>
        ) : (
          <WebView
            ref={webRef}
            originWhitelist={['*']}
            source={{ html }}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            injectedJavaScript={BRIDGE_JS}
            onMessage={handleMessage}
          />
        )}
      </View>

      <ScrollView style={styles.bottomPanel} contentContainerStyle={styles.bottomContent}>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatClock(currentSec)} / {formatClock(durationSec)}</Text>
          <Text style={styles.timeText}>Speed {speed}x</Text>
        </View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${totalProgress}%` }]} /></View>

        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.ctrlBtn} onPress={() => seekBy(-10)}><Text style={styles.ctrlText}>-10s</Text></TouchableOpacity>
          <TouchableOpacity style={styles.ctrlBtnPrimary} onPress={togglePlayPause}><Text style={styles.ctrlTextPrimary}>{paused ? 'Play' : 'Pause'}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.ctrlBtn} onPress={() => seekBy(10)}><Text style={styles.ctrlText}>+10s</Text></TouchableOpacity>
          <TouchableOpacity style={styles.ctrlBtn} onPress={toggleMute}><Text style={styles.ctrlText}>{muted ? 'Unmute' : 'Mute'}</Text></TouchableOpacity>
        </View>

        <View style={styles.controlRow}>
          {[0.5, 0.75, 1, 1.25, 1.5].map((rate) => (
            <TouchableOpacity key={rate} style={styles.ctrlBtn} onPress={() => setPlaybackRate(rate)}>
              <Text style={[styles.ctrlText, speed === rate && styles.ctrlTextActive]}>{rate}x</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeScene && (
          <Card style={styles.activeCard}>
            <Text style={styles.activeLabel}>Current Chapter</Text>
            <Text style={styles.activeTitle}>{activeScene.heading || `Scene ${activeChapter + 1}`}</Text>
            {(activeScene.bullets || []).slice(0, 3).map((point) => (
              <Text key={point} style={styles.activeBullet}>• {point}</Text>
            ))}
          </Card>
        )}

        {scenes.length > 0 && (
          <View style={styles.chapterWrap}>
            <Text style={styles.chapterTitle}>Chapters</Text>
            {scenes.map((scene, index) => (
              <TouchableOpacity
                key={scene.id || `scene-${index}`}
                style={[styles.chapterRow, index === activeChapter && styles.chapterRowActive]}
                onPress={() => jumpToScene(index)}
              >
                <View style={styles.chapterIndex}><Text style={styles.chapterIndexText}>{index + 1}</Text></View>
                <View style={styles.chapterBody}>
                  <Text style={styles.chapterHeading} numberOfLines={1}>{scene.heading || `Scene ${index + 1}`}</Text>
                  <Text style={styles.chapterMeta}>{scene.durationSec || 0}s</Text>
                </View>
                <Ionicons name="play" size={14} color="#93c5fd" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: { flex: 1, backgroundColor: '#0b1020' },
  container: { paddingBottom: spacing.xl },
  title: {
    fontSize: typography.h3,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
  },
  error: { fontSize: typography.body, color: colors.error, marginBottom: spacing.md },
  backBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  backText: { color: colors.primaryDark, fontSize: typography.small, fontFamily: typography.fontHeadline },
  header: {
    height: 58,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
  },
  headerBody: { flex: 1 },
  headerTitle: {
    color: '#fff',
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
  },
  headerSub: { color: '#93c5fd', fontSize: 11 },
  playerArea: {
    height: '52%',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  bottomPanel: {
    flex: 1,
  },
  bottomContent: {
    padding: spacing.sm,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    color: '#93c5fd',
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#1e293b',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  controlRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  ctrlBtn: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: '#111827',
  },
  ctrlBtnPrimary: {
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: '#2563eb',
  },
  ctrlText: {
    color: '#cbd5e1',
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
  },
  ctrlTextPrimary: {
    color: '#fff',
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
  },
  ctrlTextActive: {
    color: '#60a5fa',
  },
  activeCard: {
    marginBottom: 0,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
  },
  activeLabel: {
    fontSize: typography.xsmall,
    color: '#93c5fd',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  activeTitle: {
    color: '#fff',
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    marginBottom: 4,
  },
  activeBullet: {
    color: '#cbd5e1',
    fontSize: typography.xsmall,
    marginBottom: 2,
  },
  chapterWrap: {
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    backgroundColor: '#0f172a',
    padding: spacing.sm,
  },
  chapterTitle: {
    color: '#dbeafe',
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  chapterRowActive: {
    backgroundColor: '#172554',
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  chapterIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d4ed8',
  },
  chapterIndexText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: typography.fontHeadline,
  },
  chapterBody: {
    flex: 1,
  },
  chapterHeading: {
    color: '#e2e8f0',
    fontSize: typography.small,
  },
  chapterMeta: {
    color: '#94a3b8',
    fontSize: typography.xsmall,
  },
});
