document.addEventListener("DOMContentLoaded", () => {
  window.currentAppTheme = 'Blue';
  window.currentAppDarkMode = false;
  window.globalCanvasClasses = 'padding-40px'; 
  const exportBtn = new ECButton('Export', { variant: 'filled' });
  exportBtn.element.className += ' width-100% padding-10px';
  exportBtn.onClick(exportToHybridHTML);
  document.getElementById('sidebar-footer').appendChild(exportBtn.element);
  class ECTypography {
    constructor(tag, defaultText) {
      this.element = document.createElement(tag);
      this.element.innerText = defaultText;
      
      let baseClass = 'margin-0 color-var(--ec-text,_#212529)';
      if (tag === 'h1') baseClass += ' fontSize-32px fontWeight-700 lineHeight-1.2';
      if (tag === 'h2') baseClass += ' fontSize-24px fontWeight-600 lineHeight-1.3';
      if (tag === 'p') baseClass += ' fontSize-16px lineHeight-1.6 color-var(--ec-text-muted,_#6c757d)';
      
      this.element.className = baseClass;
      this.element.dataset.baseClass = baseClass;
      this._builder_data = { text: defaultText, tag: tag, align: 'left', className: '' };
    }
    setText(text) { this.element.innerText = text; }
    setAlign(align) {
      this.element.classList.remove('textAlign-left', 'textAlign-center', 'textAlign-right', 'textAlign-justify');
      if(align && align !== 'left') this.element.classList.add(`textAlign-${align}`);
      this.element.dataset.baseClass = this.element.className.replace(this._builder_data.className || '', '').trim();
    }
    setTheme() {} enableDarkMode() {} disableDarkMode() {}
  }
  class LayoutContainer {
    constructor(type) {
      this.element = document.createElement('div');
      this.element.className = 'container-layout display-flex gap-16px width-100% boxSizing-border-box flexWrap-wrap minHeight-60px';
      if (type === 'Card Container') {
        this.element.classList.add('eccard', 'padding-24px');
      }
      this.cols = [];
      this._builder_data = { columns: 1 };
      this.setColumns(1);
    }
    setColumns(n) {
      n = parseInt(n, 10);
      if (isNaN(n) || n < 1) n = 1;
      this._builder_data.columns = n;
      
      while(this.cols.length < n) {
        const col = document.createElement('div');
        col.className = 'col-layout drop-zone flex-1 display-flex flexDirection-column gap-12px boxSizing-border-box border-1px_dashed_#adb5bd minHeight-50px padding-12px borderRadius-6px background-rgba(255,255,255,0.2)';
        col.style.minWidth = '200px';
        this.cols.push(col);
        this.element.appendChild(col);
      }
      while(this.cols.length > n) {
        const col = this.cols.pop();
        const firstCol = this.cols[0];
        if (firstCol) {
          while(col.firstChild) firstCol.appendChild(col.firstChild);
        }
        col.remove();
      }
    }
    getColumns() { return this._builder_data.columns; }
    setTheme() {} enableDarkMode() {} disableDarkMode() {}
  }
  const componentFactory = {
    'Typography: Heading': () => new ECTypography('h1', 'Main Heading'),
    'Typography: Sub-heading': () => new ECTypography('h2', 'Sub-heading'),
    'Typography: Paragraph': () => new ECTypography('p', 'This is a paragraph of text. You can edit this directly from the properties panel to describe your content.'),
    
    'Layout: Blank Container': () => new LayoutContainer('Blank Container'),
    'Layout: Card Container': () => new LayoutContainer('Card Container'),
    'ECSidebar': () => {
      const s = new ECSidebar('Sidebar');
      s.element.classList.remove('display-none', 'transform-translateX(-100%)', 'position-fixed');
      s.element.classList.add('display-block', 'transform-translateX(0)', 'position-relative');
      s.element.style.height = '300px'; s.element.style.zIndex = '1';
      s.element.dataset.builderFixed = 'ECSidebar'; 
      s._builder_data = { title: 'Sidebar', width: '260px' };
      return s;
    },
    'ECTopbar': () => {
      const t = new ECTopbar('Top Bar');
      t.element.classList.remove('position-fixed');
      t.element.classList.add('position-relative');
      t.element.dataset.builderFixed = 'ECTopbar';
      t._builder_data = { title: 'Top Bar' };
      return t;
    },
    'ECBanner': () => {
      const b = new ECBanner('Announcement Banner!', { dismissible: true, loop: false });
      b._builder_data = { text: 'Announcement Banner!', loop: false, dismissible: true };
      return b;
    },
    'ECStepper': () => {
      const st = new ECStepper(['Step 1', 'Step 2', 'Step 3'], 1);
      st._builder_data = { steps: [{label: 'Step 1'}, {label: 'Step 2'}, {label: 'Step 3'}], currentStep: 1 };
      return st;
    },
    'ECCarousel': () => {
      const c = new ECCarousel();
      c.addItem('<div style="background:#1a73e8; color:#fff; height:150px; display:flex; align-items:center; justify-content:center; border-radius:10px;">Slide 1</div>');
      c._builder_data = { items: [{html: '<div style="background:#1a73e8; color:#fff; height:150px; display:flex; align-items:center; justify-content:center; border-radius:10px;">Slide 1</div>'}] };
      return c;
    },
    'ECHero': () => {
      const h = new ECHero({ title: 'Welcome', subtitle: 'Start building your site', eyebrow: 'GET STARTED' });
      h.element.classList.remove('height-100vh'); h.element.style.padding = '60px 20px';
      h.element.dataset.builderFixed = 'ECHero';
      h._builder_data = { title: 'Welcome', subtitle: 'Start building your site', eyebrow: 'GET STARTED', background: '', imageSrc: '', imageAlt: '', imageMaxWidth: '' };
      return h;
    },
    'ECMediaCard': () => {
      const m = new ECMediaCard({ author: 'Jane Doe', content: 'This is a media card.', imageSrc: 'https://via.placeholder.com/400x200', imageHeight: '200px' });
      m._builder_data = { author: 'Jane Doe', avatarSrc: '', timestamp: '', imageSrc: 'https://via.placeholder.com/400x200', imageAlt: '', imageHeight: '200px', content: 'This is a media card.' };
      return m;
    },
    'ECAvatar': () => {
      const a = new ECAvatar({ initials: 'JD', size: '40px' });
      a._builder_data = { initials: 'JD', size: '40px', src: '', alt: '' };
      return a;
    },
    'ECBreadcrumbs': () => {
      const b = new ECBreadcrumbs([{label: 'Home', href: '#'}, {label: 'Library', href: '#'}], '/');
      b._builder_data = { separator: '/', items: [{label: 'Home', href: '#'}, {label: 'Library', href: '#'}] };
      return b;
    },
    'ECProgressBar': () => {
      const p = new ECProgressBar({ value: 50, label: 'Loading...', showPercent: true });
      p._builder_data = { value: 50, label: 'Loading...', showPercent: true, height: 8 };
      return p;
    },
    'ECCountdown': () => {
      const dt = new Date(Date.now() + 86400000);
      const c = new ECCountdown(dt);
      c._builder_data = { targetDate: dt.toISOString().split('T')[0] };
      return c;
    },
    'ECBadge': () => {
      const b = new ECBadge('Badge', 'primary');
      b._builder_data = { label: 'Badge', type: 'primary' };
      return b;
    },
    'ECSpinner': () => {
      const s = new ECSpinner({ size: 'md' });
      s._builder_data = { size: 'md' };
      return s;
    },
    'ECAccordion': () => {
      const a = new ECAccordion({ allowMultiple: false, items: [{ title: 'Section 1', content: 'Content 1', open: true }] });
      a._builder_data = { allowMultiple: false, items: [{title: 'Section 1', content: 'Content 1', open: true}] };
      return a;
    },
    'ECList': () => {
      const l = new ECList({ items: ['Item 1', 'Item 2'], variant: 'plain', direction: 'vertical' });
      l._builder_data = { items: [{text: 'Item 1'}, {text: 'Item 2'}], variant: 'plain', direction: 'vertical' };
      return l;
    },
    'ECDivider': () => {
      const d = new ECDivider({ label: 'Divider' });
      d._builder_data = { label: 'Divider', thick: false, dashed: false };
      return d;
    },
    'ECButton': () => {
      const b = new ECButton('Button');
      b._builder_data = { label: 'Button', variant: 'filled', disabled: false };
      return b;
    },
    'ECRadio': () => {
      const r = new ECRadio('radios', [{label: 'Option A', value: 'a'}]);
      r._builder_data = { options: [{value: 'a', label: 'Option A', checked: false}] };
      return r;
    },
    'ECToggle': () => {
      const t = new ECToggle('Toggle Switch', false);
      t._builder_data = { label: 'Toggle Switch', checked: false };
      return t;
    },
    'ECCheckbox': () => {
      const c = new ECCheckbox('Checkbox', false);
      c._builder_data = { label: 'Checkbox', checked: false };
      return c;
    },
    'ECTextbox': () => {
      const t = new ECTextbox({ label: 'Text Input', placeholder: 'Enter text' });
      t._builder_data = { label: 'Text Input', placeholder: 'Enter text', type: 'text', value: '' };
      return t;
    },
    'ECDropdown': () => {
      const d = new ECDropdown({ label: 'Dropdown', items: [{label: 'Item 1', value: '1'}] });
      d._builder_data = { label: 'Dropdown', options: [{value: '1', label: 'Item 1'}] };
      return d;
    },
    'ECSlider': () => {
      const s = new ECSlider({ label: 'Range Slider', min: 0, max: 100, step: 1, value: 50 });
      s._builder_data = { label: 'Range Slider', min: 0, max: 100, step: 1, value: 50, suffix: '', ticks: '' };
      return s;
    },
    'ECDatePicker': () => {
      const d = new ECDatePicker({ label: 'Date Picker' });
      d._builder_data = { label: 'Date Picker', value: '' };
      return d;
    },
    'ECFileUpload': () => {
      const f = new ECFileUpload();
      f._builder_data = { title: 'Drag & Drop files here', subtitle: 'or click to browse', accept: '*', multiple: true, maxSize: 0 };
      return f;
    },
    'ECRating': () => {
      const r = new ECRating({ value: 3, max: 5, readonly: false, showLabel: true });
      r._builder_data = { value: 3, max: 5, readonly: false, showLabel: true };
      return r;
    }
  };
  const typoProps = [
    { label: 'Text', key: 'text', type: 'textarea', update: (o, v) => o.setText(v) },
    { label: 'Alignment', key: 'align', type: 'select', options: ['left', 'center', 'right', 'justify'], update: (o, v) => o.setAlign(v) }
  ];
  function rebuildComponent(wrapper, constructFn) {
      const data = wrapper.ecObj._builder_data;
      const newObj = constructFn(data);
      newObj._builder_data = data;
      
      if(!newObj.element.dataset.baseClass) newObj.element.dataset.baseClass = newObj.element.className;
      
      if (wrapper.ecObj.element.dataset.builderFixed) {
          newObj.element.dataset.builderFixed = wrapper.ecObj.element.dataset.builderFixed;
      }
      if (data.className) newObj.element.className += ' ' + data.className;
      wrapper.replaceChild(newObj.element, wrapper.ecObj.element);
      wrapper.ecObj = newObj;
      
      if(newObj.setTheme) newObj.setTheme(window.ECTheme[window.currentAppTheme]);
      if(window.currentAppDarkMode && newObj.enableDarkMode) newObj.enableDarkMode();
      else if(!window.currentAppDarkMode && newObj.disableDarkMode) newObj.disableDarkMode();
      
      if(window.ECStyleSheet) window.ECStyleSheet.scan();
  }
  const propsConfig = {
    'Typography: Heading': typoProps,
    'Typography: Sub-heading': typoProps,
    'Typography: Paragraph': typoProps,
    
    'Layout: Blank Container': [{ label: 'Columns', key: 'columns', type: 'number', update: (o, v) => o.setColumns(v) }],
    'Layout: Card Container': [{ label: 'Columns', key: 'columns', type: 'number', update: (o, v) => o.setColumns(v) }],
    'ECSidebar': [
      { label: 'Title', key: 'title', type: 'text', update: (o, v) => o.setTitle(v) },
      { label: 'Width', key: 'width', type: 'text', update: (o, v) => o.setWidth(v) }
    ],
    'ECTopbar': [{ label: 'Title', key: 'title', type: 'text', update: (o, v) => o.setTitle(v) }],
    'ECBanner': [
      { label: 'Text', key: 'text', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECBanner(d.text, { loop: d.loop, dismissible: d.dismissible })) },
      { label: 'Loop (Marquee)', key: 'loop', type: 'checkbox', update: (o, v, w) => rebuildComponent(w, d => new ECBanner(d.text, { loop: d.loop, dismissible: d.dismissible })) },
      { label: 'Dismissible', key: 'dismissible', type: 'checkbox', update: (o, v, w) => rebuildComponent(w, d => new ECBanner(d.text, { loop: d.loop, dismissible: d.dismissible })) }
    ],
    'ECStepper': [
      { label: 'Current Step Index', key: 'currentStep', type: 'number', update: (o, v, w) => rebuildComponent(w, d => new ECStepper((d.steps||[]).map(s=>s.label), Number(d.currentStep))) },
      { label: 'Steps', key: 'steps', type: 'list', fields: [{key: 'label', label: 'Step Label'}], update: (o, v, w) => rebuildComponent(w, d => new ECStepper((d.steps||[]).map(s=>s.label), Number(d.currentStep))) }
    ],
    'ECCarousel': [
      { label: 'Items (HTML)', key: 'items', type: 'list', fields: [{key: 'html', label: 'HTML Content', type: 'textarea'}], update: (o, v, w) => rebuildComponent(w, d => {
          const c = new ECCarousel();
          (d.items || []).forEach(i => c.addItem(i.html)); return c;
      })}
    ],
    'ECHero': [
      { label: 'Eyebrow', key: 'eyebrow', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECHero(d)) },
      { label: 'Title', key: 'title', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECHero(d)) },
      { label: 'Subtitle', key: 'subtitle', type: 'textarea', update: (o, v, w) => rebuildComponent(w, d => new ECHero(d)) },
      { label: 'Background Color', key: 'background', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECHero(d)) },
      { label: 'Image URL', key: 'imageSrc', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECHero(d)) },
      { label: 'Image Alt', key: 'imageAlt', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECHero(d)) },
      { label: 'Image Max Width', key: 'imageMaxWidth', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECHero(d)) }
    ],
    'ECMediaCard': [
      { label: 'Author', key: 'author', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECMediaCard(d)) },
      { label: 'Avatar URL', key: 'avatarSrc', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECMediaCard(d)) },
      { label: 'Timestamp', key: 'timestamp', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECMediaCard(d)) },
      { label: 'Image URL', key: 'imageSrc', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECMediaCard(d)) },
      { label: 'Image Alt', key: 'imageAlt', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECMediaCard(d)) },
      { label: 'Image Height', key: 'imageHeight', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECMediaCard(d)) },
      { label: 'Content (HTML)', key: 'content', type: 'textarea', update: (o, v, w) => rebuildComponent(w, d => new ECMediaCard(d)) }
    ],
    'ECAvatar': [
      { label: 'Initials', key: 'initials', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECAvatar(d)) },
      { label: 'Size (e.g. 40px)', key: 'size', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECAvatar(d)) },
      { label: 'Image URL', key: 'src', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECAvatar(d)) },
      { label: 'Image Alt', key: 'alt', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECAvatar(d)) }
    ],
    'ECBreadcrumbs': [
      { label: 'Separator', key: 'separator', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECBreadcrumbs(d.items, d.separator)) },
      { label: 'Crumb Items', key: 'items', type: 'list', fields: [{key: 'label', label: 'Label'}, {key: 'href', label: 'URL'}], update: (o, v, w) => rebuildComponent(w, d => new ECBreadcrumbs(d.items, d.separator)) }
    ],
    'ECProgressBar': [
      { label: 'Value (0-100)', key: 'value', type: 'number', update: (o, v) => o.setValue(v) },
      { label: 'Label', key: 'label', type: 'text', update: (o, v) => o.setLabel(v) },
      { label: 'Show Percent', key: 'showPercent', type: 'checkbox', update: (o, v, w) => rebuildComponent(w, d => new ECProgressBar(d)) },
      { label: 'Height (px)', key: 'height', type: 'number', update: (o, v) => o.setHeight(v) }
    ],
    'ECCountdown': [
      { label: 'Target Date (YYYY-MM-DD)', key: 'targetDate', type: 'text', update: (o, v, w) => {
          if(o.stop) o.stop();
          rebuildComponent(w, d => new ECCountdown(d.targetDate));
      }}
    ],
    'ECBadge': [
      { label: 'Label', key: 'label', type: 'text', update: (o, v) => o.setLabel(v) },
      { label: 'Type', key: 'type', type: 'select', options: ['default', 'primary', 'success', 'warning', 'danger', 'info'], update: (o, v) => o.setType(v) }
    ],
    'ECSpinner': [{ label: 'Size', key: 'size', type: 'select', options: ['sm', 'md', 'lg'], update: (o, v) => o.setSize(v) }],
    'ECAccordion': [
      { label: 'Allow Multiple Open', key: 'allowMultiple', type: 'checkbox', update: (o, v, w) => rebuildComponent(w, d => new ECAccordion(d)) },
      { label: 'Accordion Items', key: 'items', type: 'list', fields: [{key: 'title', label: 'Title'}, {key: 'content', label: 'Content', type: 'textarea'}, {key: 'open', label: 'Start Open', type: 'checkbox'}], update: (o, v, w) => rebuildComponent(w, d => {
          const acc = new ECAccordion(d);
          (d.items || []).forEach(i => acc.addItem(i.title || 'New Section', i.content || '', i.open)); return acc;
      })}
    ],
    'ECList': [
      { label: 'Variant', key: 'variant', type: 'select', options: ['plain', 'bordered', 'striped', 'hoverable'], update: (o, v, w) => rebuildComponent(w, d => new ECList({ variant: d.variant, direction: d.direction, items: (d.items||[]).map(i=>i.text) })) },
      { label: 'Direction', key: 'direction', type: 'select', options: ['vertical', 'horizontal'], update: (o, v, w) => rebuildComponent(w, d => new ECList({ variant: d.variant, direction: d.direction, items: (d.items||[]).map(i=>i.text) })) },
      { label: 'List Items', key: 'items', type: 'list', fields: [{key: 'text', label: 'Item Text'}], update: (o, v, w) => rebuildComponent(w, d => new ECList({ variant: d.variant, direction: d.direction, items: (d.items||[]).map(i=>i.text) })) }
    ],
    'ECDivider': [
      { label: 'Label', key: 'label', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECDivider(d)) },
      { label: 'Thick', key: 'thick', type: 'checkbox', update: (o, v, w) => rebuildComponent(w, d => new ECDivider(d)) },
      { label: 'Dashed', key: 'dashed', type: 'checkbox', update: (o, v, w) => rebuildComponent(w, d => new ECDivider(d)) },
    ],
    'ECButton': [
      { label: 'Label', key: 'label', type: 'text', update: (o, v) => o.setLabel(v) },
      { label: 'Variant', key: 'variant', type: 'select', options: ['filled', 'outline', 'white'], update: (o, v, w) => rebuildComponent(w, d => new ECButton(d.label || 'Button', {variant: d.variant, disabled: d.disabled})) },
      { label: 'Disabled', key: 'disabled', type: 'checkbox', update: (o, v) => v ? o.disable() : o.enable() }
    ],
    'ECRadio': [
      { label: 'Radio Options', key: 'options', type: 'list', fields: [{key: 'value', label: 'Value'}, {key: 'label', label: 'Display Label'}, {key: 'checked', label: 'Checked', type: 'checkbox'}], update: (o, v, w) => rebuildComponent(w, d => {
          const r = new ECRadio('rad_' + Date.now());
          (d.options || []).forEach(opt => r.addOption(opt.value || 'val', opt.label || opt.value || 'Option', opt.checked));
          return r;
      })}
    ],
    'ECToggle': [
      { label: 'Label', key: 'label', type: 'text', update: (o, v) => o.setLabel(v) },
      { label: 'Checked', key: 'checked', type: 'checkbox', update: (o, v) => o.setValue(v) }
    ],
    'ECCheckbox': [
      { label: 'Label', key: 'label', type: 'text', update: (o, v) => o.setLabel(v) },
      { label: 'Checked', key: 'checked', type: 'checkbox', update: (o, v) => o.setValue(v) }
    ],
    'ECTextbox': [
      { label: 'Label', key: 'label', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECTextbox(d)) },
      { label: 'Placeholder', key: 'placeholder', type: 'text', update: (o, v) => o.setPlaceholder(v) },
      { label: 'Type', key: 'type', type: 'select', options: ['text', 'password', 'email', 'number'], update: (o, v, w) => rebuildComponent(w, d => new ECTextbox(d)) },
      { label: 'Value', key: 'value', type: 'text', update: (o, v) => o.setValue(v) }
    ],
    'ECDropdown': [
      { label: 'Label', key: 'label', type: 'text', update: (o, v, w) => rebuildComponent(w, d => {
           const dr = new ECDropdown({label: d.label});
           (d.options || []).forEach(opt => dr.addOption(opt.value || 'val', opt.label || opt.value || 'Option')); return dr;
      })},
      { label: 'Dropdown Options', key: 'options', type: 'list', fields: [{key: 'value', label: 'Value'}, {key: 'label', label: 'Display Label'}], update: (o, v, w) => rebuildComponent(w, d => {
           const dr = new ECDropdown({label: d.label});
           (d.options || []).forEach(opt => dr.addOption(opt.value || 'val', opt.label || opt.value || 'Option')); return dr;
      })}
    ],
    'ECSlider': [
      { label: 'Label', key: 'label', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECSlider({ ...d, ticks: d.ticks ? d.ticks.split(',') : null })) },
      { label: 'Min', key: 'min', type: 'number', update: (o, v, w) => rebuildComponent(w, d => new ECSlider({ ...d, ticks: d.ticks ? d.ticks.split(',') : null })) },
      { label: 'Max', key: 'max', type: 'number', update: (o, v, w) => rebuildComponent(w, d => new ECSlider({ ...d, ticks: d.ticks ? d.ticks.split(',') : null })) },
      { label: 'Step', key: 'step', type: 'number', update: (o, v, w) => rebuildComponent(w, d => new ECSlider({ ...d, ticks: d.ticks ? d.ticks.split(',') : null })) },
      { label: 'Value', key: 'value', type: 'number', update: (o, v) => o.setValue(Number(v)) },
      { label: 'Suffix (e.g. px)', key: 'suffix', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECSlider({ ...d, ticks: d.ticks ? d.ticks.split(',') : null })) },
      { label: 'Ticks (comma separated)', key: 'ticks', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECSlider({ ...d, ticks: d.ticks ? d.ticks.split(',') : null })) }
    ],
    'ECDatePicker': [
      { label: 'Label', key: 'label', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECDatePicker(d)) },
      { label: 'Value', key: 'value', type: 'text', update: (o, v) => o.setValue(v) }
    ],
    'ECFileUpload': [
      { label: 'Title', key: 'title', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECFileUpload(d)) },
      { label: 'Subtitle', key: 'subtitle', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECFileUpload(d)) },
      { label: 'Accept MIME Types', key: 'accept', type: 'text', update: (o, v, w) => rebuildComponent(w, d => new ECFileUpload(d)) },
      { label: 'Allow Multiple', key: 'multiple', type: 'checkbox', update: (o, v, w) => rebuildComponent(w, d => new ECFileUpload(d)) },
      { label: 'Max Size (bytes)', key: 'maxSize', type: 'number', update: (o, v, w) => rebuildComponent(w, d => new ECFileUpload({ ...d, maxSize: d.maxSize ? Number(d.maxSize) : null })) }
    ],
    'ECRating': [
      { label: 'Value (0-5)', key: 'value', type: 'number', update: (o, v) => o.setValue(v) },
      { label: 'Max Stars', key: 'max', type: 'number', update: (o, v, w) => rebuildComponent(w, d => new ECRating(d)) },
      { label: 'Readonly', key: 'readonly', type: 'checkbox', update: (o, v, w) => rebuildComponent(w, d => new ECRating(d)) },
      { label: 'Show Label', key: 'showLabel', type: 'checkbox', update: (o, v, w) => rebuildComponent(w, d => new ECRating(d)) }
    ]
  };
  const componentGroups = {
    'Typography': [
       'Typography: Heading', 'Typography: Sub-heading', 'Typography: Paragraph'
    ],
    'Layout & Navigation': [
       'Layout: Blank Container', 'Layout: Card Container',
       'ECSidebar', 'ECTopbar', 'ECBanner', 'ECBreadcrumbs', 'ECStepper', 'ECCarousel', 'ECHero', 'ECMediaCard'
    ],
    'Data & Feedback': [
       'ECProgressBar', 'ECCountdown', 'ECAvatar', 'ECBadge', 'ECSpinner', 'ECAccordion', 'ECList', 'ECDivider'
    ],
    'Forms & Input': [
       'ECButton', 'ECRadio', 'ECToggle', 'ECCheckbox', 'ECTextbox', 'ECDropdown', 'ECSlider', 'ECDatePicker', 'ECFileUpload', 'ECRating'
    ]
  };
  const list = document.getElementById('component-list');
  Object.keys(componentGroups).forEach(group => {
    const title = document.createElement('div');
    title.className = 'fontSize-12px fontWeight-700 color-var(--ec-text-muted,_#6c757d) textTransform-uppercase margin-16px_0_8px_4px letterSpacing-0.05em';
    title.textContent = group;
    list.appendChild(title);
    componentGroups[group].forEach(type => {
      const btn = document.createElement('div');
      btn.className = 'display-block width-100% padding-10px_12px marginBottom-8px background-var(--ec-surface,_#f8f9fa) border-1px_solid_var(--ec-border,_#dee2e6) borderRadius-6px cursor-grab textAlign-left fontSize-13px fontWeight-500 color-var(--ec-text,_#212529) transition-all_0.2s userSelect-none boxSizing-border-box hover:borderColor-var(--ec-accent,_#1a73e8)';
      btn.textContent = type;
      btn.draggable = true;
      btn.ondragstart = (e) => { e.dataTransfer.setData('text/plain', type); };
      list.appendChild(btn);
    });
  });
  function wrapComponent(type, ecObj) {
    const wrapper = document.createElement('div');
    wrapper.className = 'canvas-item';
    wrapper.dataset.type = type;
    wrapper.ecObj = ecObj;
    if (!ecObj._builder_data) ecObj._builder_data = {};
    
    const controls = document.createElement('div');
    controls.className = 'item-controls';
    
    const upBtn = document.createElement('button');
    upBtn.className = 'control-btn';
    upBtn.innerHTML = '&#9650;';
    upBtn.onclick = (e) => {
      e.stopPropagation();
      if(wrapper.previousElementSibling) wrapper.parentNode.insertBefore(wrapper, wrapper.previousElementSibling);
    };
    
    const downBtn = document.createElement('button');
    downBtn.className = 'control-btn';
    downBtn.innerHTML = '&#9660;';
    downBtn.onclick = (e) => {
      e.stopPropagation();
      if(wrapper.nextElementSibling) wrapper.parentNode.insertBefore(wrapper.nextElementSibling, wrapper);
    };
    
    const delBtn = document.createElement('button');
    delBtn.className = 'control-btn';
    delBtn.innerHTML = '&#10006;';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      wrapper.remove();
      showGlobalProperties();
    };
    
    controls.appendChild(upBtn);
    controls.appendChild(downBtn);
    controls.appendChild(delBtn);
    wrapper.appendChild(controls);
    
    const contentEl = ecObj.element || ecObj;
    if(!contentEl.dataset.baseClass) contentEl.dataset.baseClass = contentEl.className;
    wrapper.appendChild(contentEl);
    if(ecObj.setTheme) ecObj.setTheme(window.ECTheme[window.currentAppTheme]);
    if(window.currentAppDarkMode && ecObj.enableDarkMode) ecObj.enableDarkMode();
    wrapper.onclick = (e) => {
      e.stopPropagation();
      document.querySelectorAll('.canvas-item').forEach(el => el.classList.remove('selected'));
      wrapper.classList.add('selected');
      showProperties(wrapper);
    };
    
    return wrapper;
  }
  document.addEventListener('dragover', e => {
    e.preventDefault();
    const target = e.target.closest('.drop-zone');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    if (target) target.classList.add('drag-over');
  });
  document.addEventListener('dragleave', e => {
    e.preventDefault();
    const target = e.target.closest('.drop-zone');
    if (target) target.classList.remove('drag-over');
  });
  document.addEventListener('drop', e => {
    e.preventDefault();
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    
    const type = e.dataTransfer.getData('text/plain');
    if (!type || !componentFactory[type]) return;
    
    const target = e.target.closest('.drop-zone');
    if (target) {
      const ecObj = componentFactory[type]();
      const wrapped = wrapComponent(type, ecObj);
      target.appendChild(wrapped);
      if (window.ECStyleSheet) window.ECStyleSheet.scan();
    }
  });
  document.addEventListener('click', e => {
    if(!e.target.closest('.canvas-item') && !e.target.closest('#left-sidebar') && !e.target.closest('#right-sidebar')) {
      document.querySelectorAll('.canvas-item').forEach(el => el.classList.remove('selected'));
      showGlobalProperties();
    }
  });
  function applyGlobalSettings() {
    const canvas = document.getElementById('canvas');
    canvas.className = 'flex-1 overflowY-auto position-relative transition-background_0.3s,_color_0.3s drop-zone ' + window.globalCanvasClasses;
    if(window.ECStyleSheet) window.ECStyleSheet.scan();
    if(window.currentAppDarkMode) {
        canvas.style.backgroundColor = '#1a1a2e';
    } else {
        canvas.style.backgroundColor = '#f1f3f5';
    }
    document.querySelectorAll('.canvas-item').forEach(wrapper => {
      const ecObj = wrapper.ecObj;
      if(ecObj) {
        if(ecObj.setTheme) ecObj.setTheme(window.ECTheme[window.currentAppTheme]);
        if(window.currentAppDarkMode && ecObj.enableDarkMode) ecObj.enableDarkMode();
        if(!window.currentAppDarkMode && ecObj.disableDarkMode) ecObj.disableDarkMode();
      }
    });
  }
  function showGlobalProperties() {
    const panel = document.getElementById('properties-panel');
    panel.innerHTML = `<h4 class="marginTop-0 color-var(--ec-text,_#212529) borderBottom-1px_solid_var(--ec-border,_#dee2e6) paddingBottom-8px">Global Settings</h4>`;
    
    const themeDrop = new ECDropdown({ 
        label: 'App Theme Colors', 
        items: ['Blue', 'Green', 'Red', 'Purple', 'Orange', 'Dark'].map(t => ({label:t, value:t})) 
    });
    themeDrop.setValue(window.currentAppTheme);
    themeDrop.onChange(val => { window.currentAppTheme = val; applyGlobalSettings(); });
    panel.appendChild(themeDrop.element);
    const darkToggle = new ECToggle('Enable Dark Mode', window.currentAppDarkMode);
    darkToggle.onChange(val => { window.currentAppDarkMode = val; applyGlobalSettings(); });
    panel.appendChild(darkToggle.element);
    const classesBox = new ECTextbox({ label: 'Page Custom Classes', placeholder: 'e.g. padding-40px' });
    classesBox.setValue(window.globalCanvasClasses);
    classesBox.onInput(val => { window.globalCanvasClasses = val; applyGlobalSettings(); });
    panel.appendChild(classesBox.element);
  }
  function getPropValue(obj, cfg) {
    if(cfg.key === 'checked' || cfg.key === 'value') {
       if(obj.getValue) return obj.getValue();
    }
    if(cfg.key === 'step' && obj.getStep) return obj.getStep();
    if(cfg.key === 'columns' && obj.getColumns) return obj.getColumns();
    if(obj._builder_data && obj._builder_data[cfg.key] !== undefined) return obj._builder_data[cfg.key];
    return '';
  }
  function showProperties(wrapper) {
    const panel = document.getElementById('properties-panel');
    const type = wrapper.dataset.type;
    panel.innerHTML = `<h4 class="marginTop-0 color-var(--ec-text,_#212529) borderBottom-1px_solid_var(--ec-border,_#dee2e6) paddingBottom-8px">Editing: ${type}</h4>`;
    
    const obj = wrapper.ecObj;
    const el = obj.element || obj;
    if(!el.dataset.baseClass) el.dataset.baseClass = el.className;
    
    let configs = [];
    if (propsConfig[type]) configs = configs.concat(propsConfig[type]);
    
    configs.push({
      label: 'Custom Classes', key: 'className', type: 'text',
      update: (o, v) => {
        const e = o.element || o;
        e.className = e.dataset.baseClass + ' ' + v;
        if(window.ECStyleSheet) window.ECStyleSheet.scan();
      }
    });
    
    configs.forEach(cfg => {
      if (cfg.type === 'list') {
        const lbl = document.createElement('label');
        lbl.className = 'fontSize-13px fontWeight-500 color-var(--ec-text-muted,_#6c757d)';
        lbl.textContent = cfg.label;
        panel.appendChild(lbl);
        const listContainer = document.createElement('div');
        listContainer.className = 'display-flex flexDirection-column gap-8px marginTop-4px';
        const renderList = () => {
          listContainer.innerHTML = '';
          const items = getPropValue(obj, cfg) || [];
          items.forEach((item, index) => {
            const itemBox = document.createElement('div');
            itemBox.className = 'background-var(--ec-surface,_#f8f9fa) border-1px_solid_var(--ec-border,_#dee2e6) padding-10px borderRadius-6px display-flex flexDirection-column gap-8px position-relative';
            cfg.fields.forEach(field => {
              let fInput;
              if (field.type === 'checkbox') {
                  fInput = new ECCheckbox(field.label, !!item[field.key]);
                  fInput.onChange(val => {
                    item[field.key] = val; obj._builder_data[cfg.key] = items; cfg.update(obj, items, wrapper);
                  });
              } else if (field.type === 'textarea') {
                  fInput = { element: document.createElement('textarea') };
                  fInput.element.className = 'prop-textarea';
                  fInput.element.rows = 2;
                  fInput.element.placeholder = field.label;
                  fInput.element.value = item[field.key] || '';
                  fInput.element.oninput = (e) => {
                    item[field.key] = e.target.value; obj._builder_data[cfg.key] = items; cfg.update(obj, items, wrapper);
                  };
              } else if (field.type === 'select') {
                  fInput = new ECDropdown({ label: field.label, items: (field.options||[]).map(o => ({label: o, value: o})) });
                  fInput.setValue(item[field.key] || '');
                  fInput.onChange(val => {
                    item[field.key] = val; obj._builder_data[cfg.key] = items; cfg.update(obj, items, wrapper);
                  });
              } else {
                  fInput = new ECTextbox({ label: field.label, type: field.type || 'text', value: item[field.key] || '' });
                  fInput.onInput(val => {
                    item[field.key] = val; obj._builder_data[cfg.key] = items; cfg.update(obj, items, wrapper);
                  });
              }
              itemBox.appendChild(fInput.element);
            });
            const delBtn = new ECButton('Remove', { variant: 'outline' }).setTheme(ECTheme.Red);
            delBtn.element.className += ' padding-4px_8px fontSize-11px alignSelf-flex-end';
            delBtn.onClick(() => {
              items.splice(index, 1);
              obj._builder_data[cfg.key] = items;
              cfg.update(obj, items, wrapper);
              renderList();
            });
            itemBox.appendChild(delBtn.element);
            listContainer.appendChild(itemBox);
          });
          const addBtn = new ECButton('+ Add Item', { variant: 'outline' });
          addBtn.element.className += ' width-100% borderStyle-dashed background-var(--ec-bg,_#fff)';
          addBtn.onClick(() => {
            const newItem = {};
            cfg.fields.forEach(f => {
                if (f.type === 'checkbox') newItem[f.key] = false;
                else newItem[f.key] = '';
            });
            items.push(newItem);
            obj._builder_data[cfg.key] = items;
            cfg.update(obj, items, wrapper);
            renderList();
          });
          listContainer.appendChild(addBtn.element);
        };
        renderList();
        panel.appendChild(listContainer);
      } else if (cfg.type === 'select') {
          let dd = new ECDropdown({ label: cfg.label, items: cfg.options.map(o => ({label:o, value:o})) });
          dd.setValue(getPropValue(obj, cfg));
          dd.onChange(val => { obj._builder_data[cfg.key] = val; cfg.update(obj, val, wrapper); });
          panel.appendChild(dd.element);
      } else if (cfg.type === 'checkbox') {
          let cb = new ECCheckbox(cfg.label, !!getPropValue(obj, cfg));
          cb.onChange(val => { obj._builder_data[cfg.key] = val; cfg.update(obj, val, wrapper); });
          panel.appendChild(cb.element);
      } else if (cfg.type === 'textarea') {
          let wrap = document.createElement('div');
          let lbl = document.createElement('label');
          lbl.className = 'fontSize-13px fontWeight-500 color-var(--ec-text-muted,_#6c757d) display-block marginBottom-4px';
          lbl.textContent = cfg.label;
          let ta = document.createElement('textarea');
          ta.className = 'prop-textarea';
          ta.rows = 4;
          ta.value = getPropValue(obj, cfg);
          ta.oninput = (e) => { obj._builder_data[cfg.key] = e.target.value; cfg.update(obj, e.target.value, wrapper); };
          wrap.appendChild(lbl); wrap.appendChild(ta);
          panel.appendChild(wrap);
      } else {
          let typeMap = cfg.type === 'number' ? 'number' : 'text';
          let tb = new ECTextbox({ label: cfg.label, value: getPropValue(obj, cfg), type: typeMap });
          if (cfg.key === 'className') tb.setValue(el.className.replace(el.dataset.baseClass, '').trim());
          tb.onInput(val => { obj._builder_data[cfg.key] = val; cfg.update(obj, val, wrapper); });
          panel.appendChild(tb.element);
      }
    });
  }
  function generateComponentJS(type, data, v) {
    let code = `    // ${type}\n    `;
    const safeStr = val => JSON.stringify(val || '');
    const nSafe = val => Number(val) || 0;
    
    switch(type) {
      case 'ECSidebar': code += `var ${v} = new ECSidebar(${safeStr(data.title)}).setWidth(${safeStr(data.width)});`; break;
      case 'ECTopbar': code += `var ${v} = new ECTopbar(${safeStr(data.title)});`; break;
      case 'ECBanner': code += `var ${v} = new ECBanner(${safeStr(data.text)}, {loop: ${!!data.loop}, dismissible: ${!!data.dismissible}});`; break;
      case 'ECStepper': code += `var ${v} = new ECStepper(${JSON.stringify((data.steps||[]).map(s=>s.label))}, ${nSafe(data.currentStep)});`; break;
      case 'ECCarousel': 
          code += `var ${v} = new ECCarousel();\n`;
          (data.items||[]).forEach(i => { code += `    ${v}.addItem(${safeStr(i.html)});\n`; });
          break;
      case 'ECHero': code += `var ${v} = new ECHero(${JSON.stringify(data)});`; break;
      case 'ECMediaCard': code += `var ${v} = new ECMediaCard(${JSON.stringify(data)});`; break;
      case 'ECAvatar': code += `var ${v} = new ECAvatar(${JSON.stringify(data)});`; break;
      case 'ECBreadcrumbs': code += `var ${v} = new ECBreadcrumbs(${JSON.stringify(data.items)}, ${safeStr(data.separator)});`; break;
      case 'ECProgressBar': 
          code += `var ${v} = new ECProgressBar(${JSON.stringify(data)});\n`; 
          if (data.height) code += `    ${v}.setHeight(${nSafe(data.height)});\n`;
          break;
      case 'ECCountdown': code += `var ${v} = new ECCountdown(${safeStr(data.targetDate)});`; break;
      case 'ECBadge': code += `var ${v} = new ECBadge(${safeStr(data.label)}, ${safeStr(data.type)});`; break;
      case 'ECSpinner': code += `var ${v} = new ECSpinner({ size: ${safeStr(data.size)} });`; break;
      case 'ECAccordion': 
          code += `var ${v} = new ECAccordion({allowMultiple: ${!!data.allowMultiple}});\n`;
          (data.items||[]).forEach(i => { code += `    ${v}.addItem(${safeStr(i.title)}, ${safeStr(i.content)}, ${!!i.open});\n`; });
          break;
      case 'ECList': 
          code += `var ${v} = new ECList({variant: ${safeStr(data.variant)}, direction: ${safeStr(data.direction)}});\n`;
          (data.items||[]).forEach(i => { code += `    ${v}.addItem(${safeStr(i.text)});\n`; });
          break;
      case 'ECDivider': code += `var ${v} = new ECDivider(${JSON.stringify(data)});`; break;
      case 'ECButton': 
          code += `var ${v} = new ECButton(${safeStr(data.label)}, {variant: ${safeStr(data.variant)}});\n`;
          if (data.disabled) code += `    ${v}.disable();\n`;
          break;
      case 'ECRadio': code += `var ${v} = new ECRadio("rad_" + Math.random().toString(36).substr(2, 9), ${JSON.stringify(data.options)});`; break;
      case 'ECToggle': code += `var ${v} = new ECToggle(${safeStr(data.label)}, ${!!data.checked});`; break;
      case 'ECCheckbox': code += `var ${v} = new ECCheckbox(${safeStr(data.label)}, ${!!data.checked});`; break;
      case 'ECTextbox': code += `var ${v} = new ECTextbox(${JSON.stringify(data)});`; break;
      case 'ECDropdown': code += `var ${v} = new ECDropdown({label: ${safeStr(data.label)}, items: ${JSON.stringify(data.options)}});`; break;
      case 'ECSlider': 
          let tks = data.ticks ? data.ticks.split(',') : null;
          code += `var ${v} = new ECSlider({label: ${safeStr(data.label)}, min: ${nSafe(data.min)}, max: ${nSafe(data.max)}, step: ${nSafe(data.step)}, value: ${nSafe(data.value)}, suffix: ${safeStr(data.suffix)}, ticks: ${JSON.stringify(tks)}});`;
          break;
      case 'ECDatePicker': code += `var ${v} = new ECDatePicker(${JSON.stringify(data)});`; break;
      case 'ECFileUpload': code += `var ${v} = new ECFileUpload(${JSON.stringify(data)});`; break;
      case 'ECRating': code += `var ${v} = new ECRating(${JSON.stringify(data)});`; break;
      default: code += `var ${v} = { element: document.createElement("div") }; ${v}.element.textContent = "Unknown Component";`; break;
    }
    
    if(data.className) {
        code += `\n    if(${v} && ${v}.element) ${v}.element.className += " " + ${safeStr(data.className)};`;
    }
    code += `\n    if(${v} && ${v}.setTheme) ${v}.setTheme(window.ECTheme['${window.currentAppTheme}']);`;
    if (window.currentAppDarkMode) {
        code += `\n    if(${v} && ${v}.enableDarkMode) ${v}.enableDarkMode();`;
    }
    return code + '\n';
  }
  let ecStyleSheetCode = '';
  let ecElementsCode = '';
  fetch("https://isaiahnoelpulidosalazar.github.io/js/ECStyleSheet.js")
    .then(response => response.text())
    .then(jsString => {
      ecStyleSheetCode = jsString;
    });
  fetch("https://isaiahnoelpulidosalazar.github.io/js/ECElements.js")
    .then(response => response.text())
    .then(jsString => {
      ecElementsCode = jsString;
    });
  function exportToHybridHTML() {
    let jsCode = `    // ECWebsite Generated JS Components\n`;
    let htmlOut = ``;
    let varId = 0;
    function processNode(node, indent) {
        let out = '';
        const items = Array.from(node.children).filter(c => c.classList.contains('canvas-item') || c.classList.contains('col-layout'));
        items.forEach(child => {
            if (child.classList.contains('col-layout')) {
                out += `${indent}<div class="flex-1 display-flex flexDirection-column gap-12px boxSizing-border-box minWidth-200px">\n`;
                out += processNode(child, indent + '  ');
                out += `${indent}</div>\n`;
                return;
            }
            const type = child.dataset.type;
            const data = child.ecObj._builder_data || {};
            const customClasses = data.className ? ` ${data.className}` : '';
            if (type.startsWith('Layout:')) {
                let baseCls = 'display-flex gap-16px width-100% boxSizing-border-box flexWrap-wrap';
                if (type === 'Layout: Card Container') baseCls += ' eccard padding-24px';
                out += `${indent}<div class="${baseCls}${customClasses}">\n`;
                out += processNode(child.ecObj.element, indent + '  ');
                out += `${indent}</div>\n`;
            } 
            else if (type.startsWith('Typography:')) {
                const tag = data.tag || 'p';
                const baseCls = child.ecObj.element.className.replace('canvas-item', '').replace('selected', '').replace(/drop-zone|drag-over/g, '').trim();
                const textHTML = (data.text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
                out += `${indent}<${tag} class="${baseCls}${customClasses}">${textHTML}</${tag}>\n`;
            }
            else {
                varId++;
                const anchorId = `ec_anchor_${varId}`;
                out += `${indent}<!-- Placeholder for ${type} -->\n`;
                out += `${indent}<div id="${anchorId}"></div>\n`;
                const v = 'comp_' + varId;
                jsCode += generateComponentJS(type, data, v);
                jsCode += `    document.getElementById('${anchorId}').replaceWith(${v}.element || ${v});\n\n`;
            }
        });
        return out;
    }
    htmlOut += processNode(document.getElementById('canvas'), '  ');
    const bg = window.currentAppDarkMode ? '#1a1a2e' : '#f1f3f5';
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ECWebsite</title>
  <script>
    ${ecStyleSheetCode}
  <\/script>
  <script>
    ${ecElementsCode}
  <\/script>
  <style>
    /* Base Body Styling */
    body {
      margin: 0; min-height: 100vh; box-sizing: border-box;
      background: ${bg};
    }
  </style>
</head>
<body class="${window.globalCanvasClasses}">
  <!-- Hybrid Structure (Layouts & Typography in DOM, ECElements via JS anchors) -->
${htmlOut}
  <script>
  document.addEventListener("DOMContentLoaded", function() {
${jsCode}
    // Re-trigger dynamic stylesheet to catch dynamically injected classes
    if (window.ECStyleSheet) window.ECStyleSheet.scan();
  });
  <\/script>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecwebsite.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  showGlobalProperties();
});