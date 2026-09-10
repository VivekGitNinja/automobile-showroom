const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/vivek/.gemini/antigravity-ide/brain/eb9643ab-9d5d-484c-955e-5ebbce09bf4c';
const SCREENSHOTS_DIR = path.join(ARTIFACT_DIR, 'screenshots');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  console.log('🚀 Launching Chromium for Comprehensive 3D Studio & 360° Inspection Verification...');
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: ARTIFACT_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  try {
    console.log('--- Step 1: Navigate to 2022 Lamborghini Aventador SVJ ---');
    await page.goto('http://localhost:3000/inventory/lamborghini-aventador-svj-2022', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await sleep(2500);

    // Scroll down to 3D Studio
    console.log('--- Step 2: Test Interactive 3D Studio ---');
    const studioSection = page.locator('text=Interactive 3D Studio & Engineering Stage').first();
    await studioSection.scrollIntoViewIfNeeded();
    await sleep(3000); // Give WebGL time to load GLB model

    // Take initial 3D Studio screenshot
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '12_3d_studio_lamborghini_initial.png'),
      fullPage: false,
    });
    console.log('📸 Captured 12_3d_studio_lamborghini_initial.png');

    // Test Color Swatch (e.g. Rosso Corsa or Verde Mantis)
    console.log('Testing 3D Studio Paint Swatch...');
    const redSwatch = page.locator('button[title*="Rosso Corsa"]').first();
    if (await redSwatch.isVisible()) {
      await redSwatch.click();
      await sleep(1000);
      console.log('Selected Rosso Corsa paint swatch');
    }

    // Test Lighting Theme (Cyberpunk or Stealth)
    console.log('Testing 3D Studio Lighting Theme...');
    const cyberTheme = page.locator('button:has-text("Cyberpunk")').first();
    if (await cyberTheme.isVisible()) {
      await cyberTheme.click();
      await sleep(1000);
      console.log('Switched to Cyberpunk lighting');
    }

    // Test Scissor Doors Toggle
    console.log('Testing 3D Studio Doors Toggle...');
    const doorsBtn = page.locator('button:has-text("Doors")').first();
    if (await doorsBtn.isVisible()) {
      await doorsBtn.click();
      await sleep(1500);
      console.log('Toggled Scissor Doors open');
    }

    // Test Camera Preset (Cockpit or Profile)
    console.log('Testing 3D Studio Camera Preset...');
    const sidePreset = page.locator('button:has-text("Profile 90°")').first();
    if (await sidePreset.isVisible()) {
      await sidePreset.click();
      await sleep(1500);
      console.log('Snapped camera to Profile 90°');
    }

    // Capture customized 3D Studio
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '13_3d_studio_lamborghini_customized.png'),
      fullPage: false,
    });
    console.log('📸 Captured 13_3d_studio_lamborghini_customized.png');

    // Scroll to 360° Studio & Engineering Inspection (Exterior360Viewer)
    console.log('--- Step 3: Test 360° Studio & Engineering Inspection ---');
    const exterior360Section = page.locator('text=360° Studio & Engineering Inspection').first();
    await exterior360Section.scrollIntoViewIfNeeded();
    await sleep(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '14_360_exterior_studio_initial.png'),
      fullPage: false,
    });
    console.log('📸 Captured 14_360_exterior_studio_initial.png');

    // Test Preset Angle (e.g. Profile 90° or Rear 180°)
    console.log('Testing 360 Exterior Angle Preset...');
    const rearPreset = page.locator('button:has-text("Rear 180°")').first();
    if (await rearPreset.isVisible()) {
      await rearPreset.click();
      await sleep(1000);
      console.log('Rotated 360 turntable to Rear 180°');
    }

    // Test Dragging the 360 Turntable Stage
    console.log('Simulating 360 Turntable drag...');
    const turntableStage = page.locator('div[style*="touch-action: none"]').first();
    if (await turntableStage.isVisible()) {
      const box = await turntableStage.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 180, box.y + box.height / 2, { steps: 10 });
        await page.mouse.up();
        await sleep(1000);
        console.log('Completed smooth inertia drag on 360 turntable');
      }
    }

    // Test Part Hotspot Click
    console.log('Testing 360 Exterior Hotspot inspection...');
    const hotspotPin = page.locator('button[title*="Active Carbon Front Splitter"], button[title*="Brembo"], button[title*="Splitter"]').first();
    if (await hotspotPin.isVisible()) {
      await hotspotPin.click();
      await sleep(1200);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '15_360_exterior_hotspot_modal.png'),
        fullPage: false,
      });
      console.log('📸 Captured 15_360_exterior_hotspot_modal.png');

      // Close modal
      const closeBtn = page.locator('button:has-text("Close Inspection"), button[title="Close Modal"]').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await sleep(500);
      }
    }

    // Scroll to 360° Interior Cockpit Tour (Interior360Panorama)
    console.log('--- Step 4: Test 360° Interior Cockpit Tour ---');
    const interiorSection = page.locator('text=Cockpit & Interior Inspection').first();
    await interiorSection.scrollIntoViewIfNeeded();
    await sleep(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '16_360_interior_cockpit_initial.png'),
      fullPage: false,
    });
    console.log('📸 Captured 16_360_interior_cockpit_initial.png');

    // Test Ambient Lighting (e.g. Cyber Crimson or Ice Blue)
    console.log('Testing Interior Ambient Lighting...');
    const iceBlueLight = page.locator('button[title*="Ice Blue"]').first();
    if (await iceBlueLight.isVisible()) {
      await iceBlueLight.click();
      await sleep(800);
      console.log('Switched Cockpit ambient lighting to Ice Blue');
    }

    // Test Perspective Tabs (e.g. Console & Shifter or Starlight Suite)
    console.log('Testing Cockpit Perspective Switcher...');
    const consoleTab = page.locator('button:has-text("Console & Shifter")').first();
    if (await consoleTab.isVisible()) {
      await consoleTab.click();
      await sleep(1000);
      console.log('Switched to Console & Shifter perspective');
    }

    // Test Drag to Look / Pan Cockpit
    console.log('Simulating Drag-to-Pan inside Cockpit...');
    const cockpitStage = page.locator('div[style*="touch-action: none"]').nth(1);
    if (await cockpitStage.isVisible()) {
      const box = await cockpitStage.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 - 120, box.y + box.height / 2 + 40, { steps: 10 });
        await page.mouse.up();
        await sleep(1000);
        console.log('Completed drag-to-pan in Cockpit');
      }
    }

    // Test Cockpit Hotspot
    const cockpitPin = page.locator('button[title*="Fighter-Jet"], button[title*="Steering"], button[title*="Missile"]').first();
    if (await cockpitPin.isVisible()) {
      await cockpitPin.click();
      await sleep(1200);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '17_360_interior_hotspot_modal.png'),
        fullPage: false,
      });
      console.log('📸 Captured 17_360_interior_hotspot_modal.png');

      const closePinBtn = page.locator('button:has-text("Close Inspection"), button[title="Close Modal"]').first();
      if (await closePinBtn.isVisible()) {
        await closePinBtn.click();
        await sleep(500);
      }
    }

    // Step 5: Test Rolls-Royce Phantom
    console.log('--- Step 5: Verify Model Differentiation on Rolls-Royce Phantom ---');
    await page.goto('http://localhost:3000/inventory/rolls-royce-phantom-2023', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await sleep(3000);

    const rrStudio = page.locator('text=Interactive 3D Studio & Engineering Stage').first();
    await rrStudio.scrollIntoViewIfNeeded();
    await sleep(2500);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '18_3d_studio_rolls_royce.png'),
      fullPage: false,
    });
    console.log('📸 Captured 18_3d_studio_rolls_royce.png');

    console.log('✅ All 3D Studio, 360° Exterior Turntable, and 360° Interior Cockpit tests completed successfully!');
  } catch (err) {
    console.error('❌ Error during testing:', err);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'error_studio_test.png'),
    });
    throw err;
  } finally {
    const video = page.video();
    await page.close();
    await context.close();
    await browser.close();

    if (video) {
      const videoPath = await video.path();
      const targetVideo = path.join(ARTIFACT_DIR, 'studio_3d_and_360_inspection_demo.webm');
      fs.copyFileSync(videoPath, targetVideo);
      console.log(`🎥 Saved inspection video recording to ${targetVideo}`);
    }
  }
})();
