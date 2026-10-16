(function() {
  try {
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'theme-change' && e.data.theme) {
        document.documentElement.setAttribute('data-theme', e.data.theme);
      }
    });
  } catch (err) {}
})();

function buildSummary() {
  var form = document.getElementById('quote-form');
  if (!form) return { text: '', nome: '', email: '' };

  var nome = form.nome.value.trim();
  var email = form.email.value.trim();
  var whatsapp = form.whatsapp.value.trim();
  var modalidade = form.querySelector('input[name="modalidade"]:checked') ? form.querySelector('input[name="modalidade"]:checked').value : '';

  var servicos = Array.from(form.querySelectorAll('input[name="servico"]:checked')).map(function(el) { return el.value; });
  var idiomas = Array.from(form.querySelectorAll('input[name="idioma"]:checked')).map(function(el) { return el.value; });
  var detalhes = form.detalhes ? form.detalhes.value.trim() : '';

  var datas = Array.from(form.querySelectorAll('input[name="data"]')).map(function(el) { return el.value; }).filter(Boolean);
  var inicio = form.horario_inicio ? form.horario_inicio.value : '';
  var fim = form.horario_fim ? form.horario_fim.value : '';

  var lang = document.documentElement.lang || 'pt';
  var titulos = {
    pt: { res: 'Solicitação de orçamento — Gaia Language Services', n: 'Nome', e: 'E-mail', w: 'WhatsApp', p: 'Prefere ser contatado por', t: 'Tipo de serviço', i: 'Idiomas', c: 'Contexto do evento', d: 'Data(s) do evento', h: 'Horário', a: 'às' },
    en: { res: 'Quote request — Gaia Language Services', n: 'Name', e: 'E-mail', w: 'WhatsApp', p: 'Prefers contact by', t: 'Type of service', i: 'Languages', c: 'Event context', d: 'Event date(s)', h: 'Time', a: 'to' },
    es: { res: 'Solicitud de presupuesto — Gaia Language Services', n: 'Nombre', e: 'Correo', w: 'WhatsApp', p: 'Prefiere contacto por', t: 'Tipo de servicio', i: 'Idiomas', c: 'Contexto del evento', d: 'Fecha(s) del evento', h: 'Horario', a: 'a las' }
  };

  var t = titulos[lang];
  var lines = [];
  lines.push(t.res);
  lines.push('');
  lines.push(t.n + ': ' + (nome || '-'));
  lines.push(t.e + ': ' + (email || '-'));
  lines.push(t.w + ': ' + (whatsapp || '-'));
  lines.push(t.p + ': ' + modalidade);
  lines.push('');
  lines.push(t.t + ': ' + (servicos.length ? servicos.join('; ') : '-'));
  lines.push(t.i + ': ' + (idiomas.length ? idiomas.join('; ') : '-'));
  if (detalhes) lines.push(t.c + ': ' + detalhes);
  lines.push('');
  lines.push(t.d + ': ' + (datas.length ? datas.join(', ') : '-'));
  lines.push(t.h + ': ' + (inicio || '-') + (fim ? (' ' + t.a + ' ' + fim) : ''));
  return { text: lines.join('\n'), nome: nome, email: email };
}

function validateRequired() {
  var form = document.getElementById('quote-form');
  var msg = document.getElementById('form-msg');
  var lang = document.documentElement.lang || 'pt';
  if (!form || !msg) return false;
  
  if (!form.nome.value.trim() || !form.email.value.trim() || !form.whatsapp.value.trim()) {
    if (typeof dicionario !== 'undefined' && dicionario[lang] && dicionario[lang].msg_validacao) {
      msg.textContent = dicionario[lang].msg_validacao;
    } else {
      msg.textContent = "Por favor, preencha os campos obrigatórios.";
    }
    msg.classList.add('show');
    return false;
  }
  msg.classList.remove('show');
  return true;
}

document.querySelectorAll('.mobile-menu-list a').forEach(link => {
  link.addEventListener('click', () => {
    var parentMenu = link.closest('.mobile-menu');
    if (parentMenu) {
      parentMenu.removeAttribute('open');
    }
  });
});

// =========================================================================
// SISTEMA SEGURO DE TRADUÇÃO TRILÍNGUE (Isolado e Modular)
// =========================================================================
function aplicarTraducao(idioma) {
  let dicionarioValido = {};

  if (typeof dicionario !== 'undefined' && dicionario[idioma]) {
    dicionarioValido = { ...dicionarioValido, ...dicionario[idioma] };
  } else if (typeof dicionario !== 'undefined' && dicionario['pt']) {
    dicionarioValido = { ...dicionarioValido, ...dicionario['pt'] };
  }

  if (typeof dicionarioPolitica !== 'undefined' && dicionarioPolitica[idioma]) {
    dicionarioValido = { ...dicionarioValido, ...dicionarioPolitica[idioma] };
  } else if (typeof dicionarioPolitica !== 'undefined' && dicionarioPolitica['pt']) {
    dicionarioValido = { ...dicionarioValido, ...dicionarioPolitica['pt'] };
  }

  if (typeof dicionarioTermos !== 'undefined' && dicionarioTermos[idioma]) {
    dicionarioValido = { ...dicionarioValido, ...dicionarioTermos[idioma] };
  } else if (typeof dicionarioTermos !== 'undefined' && dicionarioTermos['pt']) {
    dicionarioValido = { ...dicionarioValido, ...dicionarioTermos['pt'] };
  }

  const idiomaFinal = (typeof dicionario !== 'undefined' && dicionario[idioma]) || 
                       (typeof dicionarioPolitica !== 'undefined' && dicionarioPolitica[idioma]) || 
                       (typeof dicionarioTermos !== 'undefined' && dicionarioTermos[idioma]) 
                       ? idioma : 'pt';
                       
  document.documentElement.lang = idiomaFinal;

  document.querySelectorAll('[data-i18n]').forEach(elemento => {
    const chave = elemento.getAttribute('data-i18n');
    if (dicionarioValido && dicionarioValido[chave] !== undefined) {
      elemento.innerHTML = dicionarioValido[chave];
    }
  });
}

function mudarIdioma(idioma) {
  localStorage.setItem('gaia_lang_pref', idioma);
  aplicarTraducao(idioma);
  var menuIdiomas = document.querySelector('.language-menu');
  if (menuIdiomas) {
    menuIdiomas.removeAttribute('open');
  }
}

// =========================================================================
// INICIALIZAÇÃO CONTROLADA (Segura contra elementos ausentes/null)
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Bloca os eventos lógicos do formulário apenas se eles existirem na página atual
  const btnAddDate = document.getElementById('add-date');
  if (btnAddDate) {
    btnAddDate.addEventListener('click', function() {
      var rows = document.getElementById('date-rows');
      var row = document.createElement('div');
      row.className = 'date-row';
      
      var lang = document.documentElement.lang || 'pt';
      var ariaLabel = lang === 'en' ? 'Remove this date' : (lang === 'es' ? 'Eliminar esta fecha' : 'Remover esta data');

      row.innerHTML = '<input type="date" name="data"><button type="button" aria-label="' + ariaLabel + '">×</button>';
      row.querySelector('button').addEventListener('click', function() { row.remove(); });
      rows.appendChild(row);
    });
  }

  const btnEmail = document.getElementById('send-email');
  if (btnEmail) {
    btnEmail.addEventListener('click', function() {
      if (!validateRequired()) return;
      var s = buildSummary();
      var lang = document.documentElement.lang || 'pt';
      var defaultSubject = lang === 'en' ? 'Quote request' : (lang === 'es' ? 'Solicitud de presupuesto' : 'Solicitação de orçamento');
      var subject = encodeURIComponent(defaultSubject + ' — ' + (s.nome || 'Gaia Language Services'));
      var body = encodeURIComponent(s.text);
      window.location.href = 'mailto:aileensb2@gmail.com?subject=' + subject + '&body=' + body;
    });
  }

  const btnWhatsapp = document.getElementById('send-whatsapp');
  if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', function() {
      if (!validateRequired()) return;
      var s = buildSummary();
      var text = encodeURIComponent(s.text);
      window.open('https://wa.me/5511937740570?text=' + text, '_blank');
    });
  }

  const idiomaDispositivo = navigator.language.substring(0, 2);
  const idiomaFinal = localStorage.getItem('gaia_lang_pref') || idiomaDispositivo;
  aplicarTraducao(idiomaFinal);
});
