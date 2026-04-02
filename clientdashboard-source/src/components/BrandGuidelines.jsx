import React, { useState, useCallback, useRef } from 'react';

/* ═══ FILE UPLOAD HELPER ═══ */
// Converts files to base64 data URLs for storage in Supabase JSONB
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, url: reader.result, type: file.type, size: file.size });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ═══ UPLOAD BUTTON COMPONENT ═══ */
function UploadButton({ label, onUpload, multiple = true, accept = 'image/*' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(files.map(fileToDataUrl));
      onUpload(results);
    } catch (err) {
      console.error('Upload error:', err);
    }
    setUploading(false);
    // Reset input so same file can be selected again
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFiles}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          padding: '10px 20px',
          background: '#1a1a1a',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: uploading ? 'wait' : 'pointer',
          fontWeight: 600,
          fontSize: 13,
          fontFamily: 'inherit',
          transition: 'background 0.2s',
        }}
      >
        {uploading ? 'Uploading...' : label}
      </button>
    </div>
  );
}

/* ═══ IMAGE GRID ═══ */
function ImageGrid({ images = [], onRemove, emptyText = 'No images uploaded yet' }) {
  if (!images.length) {
    return <p style={{ fontSize: 13, color: '#999', fontStyle: 'italic', padding: '12px 0' }}>{emptyText}</p>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 12 }}>
      {images.map((img, idx) => (
        <div key={idx} style={{ border: '1px solid #e5e2db', borderRadius: 8, padding: 8, background: '#faf8f4', position: 'relative' }}>
          <img
            src={img.url}
            alt={img.name || img.label || `Image ${idx + 1}`}
            style={{ width: '100%', height: 100, objectFit: 'contain', borderRadius: 4, background: '#fff' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div style={{ fontSize: 11, color: '#555', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {img.name || img.label || `Image ${idx + 1}`}
          </div>
          <button
            onClick={() => onRemove(idx)}
            style={{
              position: 'absolute', top: 4, right: 4,
              width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
          >x</button>
        </div>
      ))}
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
const BrandGuidelines = ({ hubData, onSave }) => {
  const brandGuidelinesData = hubData?.allData?.['brand-guidelines'] || hubData?._meta?.brandGuidelines || {};

  // Logo and Photo state
  const [logos, setLogos] = useState(brandGuidelinesData.logos || []);
  const [headshots, setHeadshots] = useState(brandGuidelinesData.headshots || (brandGuidelinesData.headshot ? [{ url: brandGuidelinesData.headshot, name: 'Headshot' }] : []));
  const [brandPhotos, setBrandPhotos] = useState(brandGuidelinesData.brandPhotos || []);

  // Color state
  const [primaryColor, setPrimaryColor] = useState(brandGuidelinesData.primaryColor || '');
  const [accentColor, setAccentColor] = useState(brandGuidelinesData.accentColor || '');
  const [additionalColors, setAdditionalColors] = useState(brandGuidelinesData.additionalColors || []);

  // Font state
  const [headingFont, setHeadingFont] = useState(brandGuidelinesData.headingFont || '');
  const [bodyFont, setBodyFont] = useState(brandGuidelinesData.bodyFont || '');
  const [accentFont, setAccentFont] = useState(brandGuidelinesData.accentFont || '');

  // Rules state
  const [complianceRules, setComplianceRules] = useState(brandGuidelinesData.complianceRules || []);

  // Debounce timer refs
  const debounceTimers = useRef({});

  const saveData = useCallback((updatedData) => {
    onSave({
      allData: {
        ...hubData?.allData,
        'brand-guidelines': updatedData
      },
      _meta: { brandGuidelines: updatedData }
    });
  }, [hubData?.allData, onSave]);

  const debouncedSave = useCallback((updatedData) => {
    if (debounceTimers.current.main) clearTimeout(debounceTimers.current.main);
    debounceTimers.current.main = setTimeout(() => saveData(updatedData), 500);
  }, [saveData]);

  const buildData = () => ({
    logos,
    headshots,
    brandPhotos,
    primaryColor,
    accentColor,
    additionalColors,
    headingFont,
    bodyFont,
    accentFont,
    complianceRules,
  });

  // Logo handlers
  const handleUploadLogos = (files) => {
    const newLogos = [...logos, ...files];
    setLogos(newLogos);
    saveData({ ...buildData(), logos: newLogos });
  };

  const handleRemoveLogo = (index) => {
    const newLogos = logos.filter((_, i) => i !== index);
    setLogos(newLogos);
    saveData({ ...buildData(), logos: newLogos });
  };

  // Headshot handlers
  const handleUploadHeadshots = (files) => {
    const newHeadshots = [...headshots, ...files];
    setHeadshots(newHeadshots);
    saveData({ ...buildData(), headshots: newHeadshots });
  };

  const handleRemoveHeadshot = (index) => {
    const newHeadshots = headshots.filter((_, i) => i !== index);
    setHeadshots(newHeadshots);
    saveData({ ...buildData(), headshots: newHeadshots });
  };

  // Brand photo handlers
  const handleUploadPhotos = (files) => {
    const newPhotos = [...brandPhotos, ...files];
    setBrandPhotos(newPhotos);
    saveData({ ...buildData(), brandPhotos: newPhotos });
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = brandPhotos.filter((_, i) => i !== index);
    setBrandPhotos(newPhotos);
    saveData({ ...buildData(), brandPhotos: newPhotos });
  };

  // Color handlers
  const handlePrimaryColorChange = (value) => {
    setPrimaryColor(value);
    debouncedSave({ ...buildData(), primaryColor: value });
  };

  const handleAccentColorChange = (value) => {
    setAccentColor(value);
    debouncedSave({ ...buildData(), accentColor: value });
  };

  const handleAddAdditionalColor = () => {
    const newColors = [...additionalColors, { label: '', hex: '' }];
    setAdditionalColors(newColors);
  };

  const handleUpdateAdditionalColor = (index, field, value) => {
    const newColors = [...additionalColors];
    newColors[index] = { ...newColors[index], [field]: value };
    setAdditionalColors(newColors);
    debouncedSave({ ...buildData(), additionalColors: newColors });
  };

  const handleRemoveAdditionalColor = (index) => {
    const newColors = additionalColors.filter((_, i) => i !== index);
    setAdditionalColors(newColors);
    saveData({ ...buildData(), additionalColors: newColors });
  };

  // Font handlers
  const handleFontChange = (fontType, value) => {
    const setter = { heading: setHeadingFont, body: setBodyFont, accent: setAccentFont }[fontType];
    setter(value);
    const updated = {
      ...buildData(),
      headingFont: fontType === 'heading' ? value : headingFont,
      bodyFont: fontType === 'body' ? value : bodyFont,
      accentFont: fontType === 'accent' ? value : accentFont,
    };
    debouncedSave(updated);
  };

  // Rules handlers
  const handleAddRule = () => {
    const newRules = [...complianceRules, { rule: '' }];
    setComplianceRules(newRules);
  };

  const handleUpdateRule = (index, value) => {
    const newRules = [...complianceRules];
    newRules[index] = { rule: value };
    setComplianceRules(newRules);
    debouncedSave({ ...buildData(), complianceRules: newRules });
  };

  const handleRemoveRule = (index) => {
    const newRules = complianceRules.filter((_, i) => i !== index);
    setComplianceRules(newRules);
    saveData({ ...buildData(), complianceRules: newRules });
  };

  const isValidHex = (hex) => /^#[0-9A-F]{6}$/i.test(hex);

  // Shared styles
  const cardStyle = {
    background: '#fff', border: '1px solid #e5e2db', borderRadius: 8,
    padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  };
  const sectionHeaderStyle = {
    fontSize: 18, fontWeight: 700, marginBottom: 16,
    paddingBottom: 12, borderBottom: '2px solid #f0f0f0', color: '#1a1a1a',
  };
  const labelStyle = { display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: '#333' };
  const inputStyle = {
    width: '100%', padding: '8px 12px', fontSize: 14,
    border: '1px solid #ddd', borderRadius: 4, fontFamily: 'inherit', boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Brand Guidelines</h1>
      </div>

      {/* SECTION 1: Logos */}
      <div style={cardStyle}>
        <h2 style={sectionHeaderStyle}>Logos</h2>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>Upload your primary logo and any additional logos (brokerage, team, icon marks, watermarks).</p>

        <ImageGrid images={logos} onRemove={handleRemoveLogo} emptyText="No logos uploaded yet" />
        <div style={{ marginTop: 12 }}>
          <UploadButton label="+ Upload Logos" onUpload={handleUploadLogos} multiple={true} />
        </div>
      </div>

      {/* SECTION 2: Headshots & Photos */}
      <div style={cardStyle}>
        <h2 style={sectionHeaderStyle}>Headshots & Photos</h2>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Headshots</label>
          <ImageGrid images={headshots} onRemove={handleRemoveHeadshot} emptyText="No headshots uploaded yet" />
          <div style={{ marginTop: 12 }}>
            <UploadButton label="+ Upload Headshots" onUpload={handleUploadHeadshots} multiple={true} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Content & Lifestyle Photos</label>
          <ImageGrid images={brandPhotos} onRemove={handleRemovePhoto} emptyText="No brand photos uploaded yet" />
          <div style={{ marginTop: 12 }}>
            <UploadButton label="+ Upload Photos" onUpload={handleUploadPhotos} multiple={true} />
          </div>
        </div>
      </div>

      {/* SECTION 3: Brand Colors */}
      <div style={cardStyle}>
        <h2 style={sectionHeaderStyle}>Brand Colors</h2>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Primary Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="color"
              value={isValidHex(primaryColor) ? primaryColor : '#5a7c65'}
              onChange={(e) => handlePrimaryColorChange(e.target.value)}
              style={{ width: 44, height: 44, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', padding: 2 }}
            />
            <input
              type="text"
              placeholder="#5a7c65"
              value={primaryColor}
              onChange={(e) => handlePrimaryColorChange(e.target.value)}
              style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Accent Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="color"
              value={isValidHex(accentColor) ? accentColor : '#D4C990'}
              onChange={(e) => handleAccentColorChange(e.target.value)}
              style={{ width: 44, height: 44, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', padding: 2 }}
            />
            <input
              type="text"
              placeholder="#D4C990"
              value={accentColor}
              onChange={(e) => handleAccentColorChange(e.target.value)}
              style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Additional Colors</label>
          {additionalColors.map((color, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: 10, background: '#faf8f4', borderRadius: 6, border: '1px solid #e5e2db' }}>
              <input
                type="color"
                value={isValidHex(color.hex) ? color.hex : '#cccccc'}
                onChange={(e) => handleUpdateAdditionalColor(idx, 'hex', e.target.value)}
                style={{ width: 36, height: 36, border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', padding: 2 }}
              />
              <input
                type="text"
                placeholder="Color name"
                value={color.label || ''}
                onChange={(e) => handleUpdateAdditionalColor(idx, 'label', e.target.value)}
                style={{ ...inputStyle, flex: '0 0 140px' }}
              />
              <input
                type="text"
                placeholder="#000000"
                value={color.hex || ''}
                onChange={(e) => handleUpdateAdditionalColor(idx, 'hex', e.target.value)}
                style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }}
              />
              <button
                onClick={() => handleRemoveAdditionalColor(idx)}
                style={{ width: 28, height: 28, background: 'none', border: 'none', color: '#c44', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
              >x</button>
            </div>
          ))}
          <button
            onClick={handleAddAdditionalColor}
            style={{ padding: '8px 16px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13, marginTop: 4 }}
          >+ Add Color</button>
        </div>
      </div>

      {/* SECTION 4: Fonts */}
      <div style={cardStyle}>
        <h2 style={sectionHeaderStyle}>Fonts</h2>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Heading Font</label>
          <input
            type="text"
            placeholder="e.g., DM Sans, Montserrat, Playfair Display"
            value={headingFont}
            onChange={(e) => handleFontChange('heading', e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Body Font</label>
          <input
            type="text"
            placeholder="e.g., Inter, Open Sans, Poppins"
            value={bodyFont}
            onChange={(e) => handleFontChange('body', e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Accent Font</label>
          <input
            type="text"
            placeholder="e.g., Georgia, Garamond (optional)"
            value={accentFont}
            onChange={(e) => handleFontChange('accent', e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* SECTION 5: State & Brokerage Marketing Rules */}
      <div style={cardStyle}>
        <h2 style={sectionHeaderStyle}>State & Brokerage Marketing Rules</h2>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>Document compliance requirements and marketing rules specific to your state or brokerage.</p>

        {complianceRules.map((ruleObj, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <textarea
              placeholder="Enter a compliance rule or marketing requirement"
              value={ruleObj.rule || ''}
              onChange={(e) => handleUpdateRule(idx, e.target.value)}
              style={{ ...inputStyle, flex: 1, minHeight: 60, resize: 'vertical' }}
            />
            <button
              onClick={() => handleRemoveRule(idx)}
              style={{ width: 28, height: 28, background: 'none', border: 'none', color: '#c44', cursor: 'pointer', fontSize: 16, flexShrink: 0, alignSelf: 'flex-start', marginTop: 8 }}
            >x</button>
          </div>
        ))}

        <button
          onClick={handleAddRule}
          style={{ padding: '8px 16px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
        >+ Add Rule</button>
      </div>
    </div>
  );
};

export default BrandGuidelines;
