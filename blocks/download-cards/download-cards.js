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
    const [imagediv, contentdiv, buttondiv] = [...row.children];
    const Image = imagediv.querySelector('picture');
    const Title = contentdiv.querySelector('p');
    const buttoncell = buttondiv.querySelectorAll(':scope > p');

    // Only process if we have at least 3 paragraph cells (link, text, style)
    if (buttoncell.length >= 3) {
      const buttonlinkelement = buttoncell[0].querySelector('a');
      const buttonlink = buttonlinkelement?.getAttribute('href');
      const buttontext = buttoncell[1].textContent.trim();
      const buttonstyle = buttoncell[2].textContent.trim();

      const buttonwrap = document.createElement('a');
      buttonwrap.href = buttonlink;
      buttonwrap.textContent = buttontext;
      buttonwrap.className = `button ${buttonstyle}`;

      // Clear the button div and append the new anchor
      buttondiv.innerHTML = '';
      const anchorwrap = document.createElement('a');
      anchorwrap.href = buttonlink;
      anchorwrap.className = 'card-link';
      anchorwrap.appendChild(Title);
      anchorwrap.appendChild(buttonwrap);
      row.innerHTML = '';
      row.appendChild(anchorwrap);
    }
  });
}
