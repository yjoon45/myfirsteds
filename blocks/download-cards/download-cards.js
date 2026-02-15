function applyClasses(elm) {
  const classes = elm.textContent.split(',').join('');
  elm.parentNode.setAttribute('class', classes);
  elm.innerHTML = '';
}

export default function decorate(block) {
  const rows = [...block.children];
  const Strong = block.querySelectorAll('strong');

  // Wrap all children of strong elements inside <nobr>
  Strong.forEach((strongElement) => {
    const nobreak = document.createElement('nobr');
    while (strongElement.firstChild) {
      nobreak.appendChild(strongElement.firstChild);
    }
    strongElement.appendChild(nobreak);
  });

  const itemRows = rows.slice(0);
  itemRows.forEach((row) => {
    const [, , contentdiv, buttondiv, classesElm] = [...row.children];
    // const _Image = imagediv.querySelector('picture');
    const Title = contentdiv.querySelector('p');
    const buttoncell = buttondiv.querySelectorAll(':scope > p');
    const wrapValue = buttondiv.querySelector('p:last-child');
    const isWrapWithLink = (wrapValue?.textContent || '') === 'true';

    applyClasses(classesElm);

    // Only process if we have at least 3 paragraph cells (link, text, style)
    if (buttoncell.length >= 3) {
      const buttonlinkelement = buttoncell[0].querySelector('a');
      const buttonlink = buttonlinkelement?.getAttribute('href');
      const buttonstyle = buttoncell[2].textContent.trim();

      const buttonwrap = document.createElement('a');
      buttonwrap.href = buttonlink;
      buttonwrap.innerHTML = buttoncell[1].innerHTML;
      buttonwrap.className = `button ${buttonstyle}`;
      buttondiv.innerHTML = '';

      if (isWrapWithLink) {
        // Clear the button div and append the new anchor
        const anchorwrap = document.createElement('a');
        anchorwrap.href = buttonlink;
        anchorwrap.className = 'card-link';
        anchorwrap.appendChild(Title);
        anchorwrap.appendChild(buttonwrap);
        row.innerHTML = '';
        row.appendChild(anchorwrap);
      } else {
        row.appendChild(buttonwrap);
      }
    }
  });
}
