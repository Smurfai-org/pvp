# Button Styles Documentation

This README explains how to use the button styles defined in the CSS code.

## Color Variables

The following CSS variables are defined in the `:root` selector for consistent theming:

- `--light`: Light background color (#E8E9EB)
- `--dark`: Dark background color (#303036)
- `--bright`: Bright accent color (#EF6F6C)
- `--highlight`: Highlight color for hover effects (#587572)
- `--secondary`: Secondary color (#8DB8A5)
- `--premium`: Premium accent color (#F0C808)
- `--text`: Default text color (#16161A)
- `--body`: Base font size (1rem)

## Base Button Style

**Class:** `.default-button`

- Background color: `var(--dark)`
- Font size: `var(--body)`
- Text color: `var(--light)`
- Padding: 1rem
- Minimum width: `fit-content`
- No border
- Box shadow: 2px 4px 4px hsl(0, 0%, 75%)
- Hover effect: background color changes to `var(--highlight)`
- Cursor changes to pointer on hover

## Size Variants

**Class:** `.large`

- Padding: 1.5rem 2rem

**Class:** `.small`

- Padding: 0.5rem

## Button Variants

### Bright Button

**Class:** `.default-button.bright`

- Background color: `var(--bright)`
- Text color: `var(--text)`
- Hover effect: background color changes to `var(--dark)` and text color to `var(--light)`

### Secondary Button

**Class:** `.default-button.secondary`

- Background color: transparent
- Text color: `var(--text)`
- Border: 3px solid `var(--dark)`
- Hover effect: border color changes to `var(--highlight)`

### Disabled Button

**Class:** `.default-button.disabled`

- Background color: `var(--dark)`
- Text color: `var(--highlight)`
- Cursor: `not-allowed`
- No hover effect (remains the same as default state)

## Usage

To apply these button styles, use the appropriate class names in your HTML:

```html
<button class="default-button">Default Button</button>
<button class="default-button large">Large Button</button>
<button class="default-button small">Small Button</button>
<button class="default-button bright">Bright Button</button>
<button class="default-button secondary">Secondary Button</button>
<button class="default-button disabled">Disabled Button</button>
```

## Customization

You can override these CSS variables and classes to customize the button styles for your project!

---

Let me know if you'd like to adjust the button styles further or add new interactive states!

