document.addEventListener('DOMContentLoaded', function() {
    // Verificação inicial dos elementos do DOM
    const requiredElements = [
        'theme-toggle', 'comparison-table-body', 'total-debt', 
        'total-debt-card', 'total-offer-card', 'economy-percentage',
        'final-value-card', 'offer-summary', 'add-debt', 'add-offer',
        'clear-all', 'cta-final-value', 'cta-economy-value', 'debt-modal',
        'offer-modal'
    ];

    const elements = {};
    let allElementsExist = true;

    requiredElements.forEach(id => {
        elements[id] = document.getElementById(id);
        if (!elements[id]) {
            console.error(`Elemento com ID '${id}' não encontrado!`);
            allElementsExist = false;
        }
    });

    if (!allElementsExist) {
        console.error('Alguns elementos essenciais não foram encontrados no DOM. A aplicação não pode continuar.');
        return;
    }

    // Elementos do DOM
    const {
        'theme-toggle': themeToggle,
        'comparison-table-body': comparisonTableBody,
        'total-debt': totalDebtElement,
        'total-debt-card': totalDebtCard,
        'total-offer-card': totalOfferCard,
        'economy-percentage': economyPercentage,
        'final-value-card': finalValueCard,
        'offer-summary': offerSummaryElement,
        'add-debt': addDebtButton,
        'add-offer': addOfferButton,
        'clear-all': clearAllButton,
        'cta-final-value': ctaFinalValue,
        'cta-economy-value': ctaEconomyValue,
        'debt-modal': debtModal,
        'offer-modal': offerModal
    } = elements;

    // Outros elementos do DOM
    const cancelDebtButton = document.getElementById('cancel-debt');
    const cancelOfferButton = document.getElementById('cancel-offer');
    const confirmDebtButton = document.getElementById('confirm-debt');
    const confirmOfferButton = document.getElementById('confirm-offer');
    const paymentTypeSelect = document.getElementById('payment-type');
    const installmentsGroup = document.getElementById('installments-group');
    const debtValueInput = document.getElementById('debt-value');
    const offerValueInput = document.getElementById('offer-value');
    const installmentsInput = document.getElementById('installments');
    const debtModalTitle = document.getElementById('debt-modal-title');
    const offerModalTitle = document.getElementById('offer-modal-title');
    const previewOriginal = document.getElementById('preview-original');
    const previewAdditional = document.getElementById('preview-additional');
    const previewTotal = document.getElementById('preview-total');
    const previewInstallments = document.getElementById('preview-installments');
    const closeModalButtons = document.querySelectorAll('.close-modal');

    // Verificação dos botões de modal
    if (!cancelDebtButton || !cancelOfferButton || !confirmDebtButton || !confirmOfferButton) {
        console.error('Botões de modal não encontrados!');
        return;
    }

    // Variáveis de estado
    let debts = [];
    let offers = [];
    let isEditingDebt = false;
    let isEditingOffer = false;
    let currentEditIndex = null;

    // Inicialização
    init();

    function init() {
        setupEventListeners();
        updateUI();
    }

    function setupEventListeners() {
        // Toggle de tema
        themeToggle.addEventListener('click', toggleTheme);
        
        // Botões principais
        addDebtButton.addEventListener('click', () => openDebtModal());
        addOfferButton.addEventListener('click', () => openOfferModal());
        clearAllButton.addEventListener('click', clearAll);
        
        // Modais
        closeModalButtons.forEach(button => {
            button.addEventListener('click', closeAllModals);
        });
        
        cancelDebtButton.addEventListener('click', closeAllModals);
        cancelOfferButton.addEventListener('click', closeAllModals);
        
        // Confirmações
        confirmDebtButton.addEventListener('click', handleDebtConfirmation);
        confirmOfferButton.addEventListener('click', handleOfferConfirmation);
        
        // Mudanças no formulário de oferta
        paymentTypeSelect.addEventListener('change', toggleInstallmentsField);
        offerValueInput.addEventListener('input', updateOfferPreview);
        installmentsInput.addEventListener('input', updateOfferPreview);
        
        // Fechar modal ao clicar fora
        window.addEventListener('click', function(event) {
            if (event.target.classList.contains('modal')) {
                closeAllModals();
            }
        });
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    function openDebtModal(editIndex = null) {
        // Verificação de segurança para o índice de edição
        if (editIndex !== null && (editIndex < 0 || editIndex >= debts.length)) {
            console.error('Índice de edição inválido:', editIndex);
            return;
        }

        isEditingDebt = editIndex !== null;
        currentEditIndex = editIndex;
        
        if (isEditingDebt && debts[currentEditIndex] !== undefined) {
            debtModalTitle.textContent = 'Editar Dívida';
            debtValueInput.value = debts[currentEditIndex].toFixed(2);
        } else {
            debtModalTitle.textContent = 'Adicionar Dívida';
            debtValueInput.value = '';
        }
        
        debtModal.classList.add('active');
    }

    function openOfferModal(editIndex = null) {
        // Verificação de segurança para o índice de edição
        if (editIndex !== null && (editIndex < 0 || editIndex >= offers.length)) {
            console.error('Índice de edição inválido:', editIndex);
            return;
        }

        if (debts.length === 0 && !isEditingOffer) {
            alert('Adicione pelo menos uma dívida antes de criar uma oferta.');
            return;
        }
        
        isEditingOffer = editIndex !== null;
        currentEditIndex = editIndex;
        
        if (isEditingOffer) {
            const offer = offers[currentEditIndex];
            if (!offer) {
                console.error('Oferta não encontrada no índice:', currentEditIndex);
                return;
            }

            offerModalTitle.textContent = 'Editar Oferta';
            offerValueInput.value = offer.originalValue.toFixed(2);
            paymentTypeSelect.value = offer.paymentType;
            
            if (offer.paymentType === 'installment') {
                installmentsGroup.style.display = 'block';
                installmentsInput.value = offer.installments;
            } else {
                installmentsGroup.style.display = 'none';
            }
        } else {
            offerModalTitle.textContent = 'Adicionar Oferta';
            offerValueInput.value = '';
            paymentTypeSelect.value = 'cash';
            installmentsGroup.style.display = 'none';
            installmentsInput.value = '12';
        }
        
        updateOfferPreview();
        offerModal.classList.add('active');
    }

    function closeAllModals() {
        debtModal.classList.remove('active');
        offerModal.classList.remove('active');
        isEditingDebt = false;
        isEditingOffer = false;
        currentEditIndex = null;
    }

    function toggleInstallmentsField() {
        installmentsGroup.style.display = paymentTypeSelect.value === 'installment' ? 'block' : 'none';
        updateOfferPreview();
    }

    function updateOfferPreview() {
        const offerValue = parseFloat(offerValueInput.value) || 0;
        const paymentType = paymentTypeSelect.value;
        const installments = parseInt(installmentsInput.value) || 12;
        
        // Cálculo seguro do desconto
        const debtReference = isEditingOffer ? 
            (debts[currentEditIndex] || 0) : 
            (debts[offers.length] || 0);
        
        const discount = Math.max(0, debtReference - offerValue);
        const additional = 200 + (discount * 0.2);
        const totalWithAdditional = offerValue + additional;
        
        // Atualizar pré-visualização
        previewOriginal.textContent = formatCurrency(offerValue);
        previewAdditional.textContent = formatCurrency(additional);
        previewTotal.textContent = formatCurrency(totalWithAdditional);
        
        if (paymentType === 'installment') {
            const installmentValue = totalWithAdditional / installments;
            previewInstallments.innerHTML = `Parcelas: <strong>${installments}x de ${formatCurrency(installmentValue)}</strong>`;
            previewInstallments.style.display = 'block';
        } else {
            previewInstallments.style.display = 'none';
        }
    }

    function handleDebtConfirmation() {
        const debtValue = parseFloat(debtValueInput.value);
        
        if (isNaN(debtValue) || debtValue <= 0) {
            alert('Por favor, insira um valor válido para a dívida.');
            return;
        }
        
        if (isEditingDebt) {
            if (currentEditIndex === null || currentEditIndex >= debts.length) {
                console.error('Índice de edição inválido');
                return;
            }
            debts[currentEditIndex] = debtValue;
        } else {
            debts.push(debtValue);
        }
        
        updateUI();
        closeAllModals();
    }

    function handleOfferConfirmation() {
        const offerValue = parseFloat(offerValueInput.value);
        const paymentType = paymentTypeSelect.value;
        let installments = 1;
        
        if (isNaN(offerValue)) {
            alert('Por favor, insira um valor válido para a oferta.');
            return;
        }
        
        if (paymentType === 'installment') {
            installments = parseInt(installmentsInput.value);
            
            if (installments < 2 || installments > 48) {
                alert('O número de parcelas deve estar entre 2 e 48.');
                return;
            }
        }
        
        // Cálculo seguro do desconto
        const debtReference = isEditingOffer ? 
            (debts[currentEditIndex] || 0) : 
            (debts[offers.length] || 0);
        
        const discount = Math.max(0, debtReference - offerValue);
        const additional = 200 + (discount * 0.2);
        const totalWithAdditional = offerValue + additional;
        let installmentValue = totalWithAdditional;
        
        if (paymentType === 'installment') {
            installmentValue = totalWithAdditional / installments;
        }
        
        const offerData = {
            originalValue: offerValue,
            paymentType: paymentType,
            installments: installments,
            additional: additional,
            totalWithAdditional: totalWithAdditional,
            installmentValue: installmentValue
        };
        
        if (isEditingOffer) {
            if (currentEditIndex === null || currentEditIndex >= offers.length) {
                console.error('Índice de edição inválido');
                return;
            }
            offers[currentEditIndex] = offerData;
        } else {
            offers.push(offerData);
        }
        
        updateUI();
        closeAllModals();
    }

    function updateUI() {
        updateComparisonTable();
        updateSummaryCards();
        updateOfferSummary();
        updateCTA();
        
        // Habilitar/desabilitar botões
        addOfferButton.disabled = debts.length === 0;
        
        // Verificar tema salvo
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    function updateComparisonTable() {
        comparisonTableBody.innerHTML = '';
        
        if (debts.length === 0) {
            comparisonTableBody.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <p>Adicione suas dívidas para começar a análise</p>
                </div>
            `;
            return;
        }
        
        const maxRows = Math.max(debts.length, offers.length);
        
        for (let i = 0; i < maxRows; i++) {
            const row = document.createElement('div');
            row.className = 'table-row';
            
            // Coluna de dívida
            const debtCol = document.createElement('div');
            debtCol.className = 'debt-row';
            
            if (i < debts.length) {
                debtCol.innerHTML = `
                    <div class="debt-item">
                        <div class="debt-value">${formatCurrency(debts[i])}</div>
                        <div class="debt-actions">
                            <button class="action-btn edit-btn" data-index="${i}">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="action-btn delete-btn" data-index="${i}">
                                <i class="fas fa-trash-alt"></i> Remover
                            </button>
                        </div>
                    </div>
                `;
                
                // Adicionar eventos aos botões
                debtCol.querySelector('.edit-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(e.currentTarget.getAttribute('data-index'));
                    if (!isNaN(index)) {
                        openDebtModal(index);
                    }
                });
                
                debtCol.querySelector('.delete-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(e.currentTarget.getAttribute('data-index'));
                    if (!isNaN(index)) {
                        deleteDebt(index);
                    }
                });
            } else {
                debtCol.innerHTML = '<div class="debt-item"></div>';
            }
            
            // Coluna de oferta
            const offerCol = document.createElement('div');
            offerCol.className = 'offer-row';
            
            if (i < offers.length) {
                const offer = offers[i];
                if (!offer) {
                    console.error('Oferta inválida no índice:', i);
                    return;
                }

                let details = '';
                
                if (offer.paymentType === 'cash') {
                    details = `À vista <span class="highlight">(Acréscimo: ${formatCurrency(offer.additional)})</span>`;
                } else {
                    details = `${offer.installments}x de <span class="highlight">${formatCurrency(offer.installmentValue)}</span> <span class="highlight">(Acréscimo: ${formatCurrency(offer.additional)})</span>`;
                }
                
                offerCol.innerHTML = `
                    <div class="offer-item">
                        <div class="offer-value">
                            ${formatCurrency(offer.originalValue)}
                            <span class="badge">${offer.paymentType === 'cash' ? 'À VISTA' : 'PARCELADO'}</span>
                        </div>
                        <div class="offer-details">${details}</div>
                        <div class="debt-actions">
                            <button class="action-btn edit-btn" data-index="${i}">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="action-btn delete-btn" data-index="${i}">
                                <i class="fas fa-trash-alt"></i> Remover
                            </button>
                        </div>
                    </div>
                `;
                
                // Adicionar eventos aos botões
                offerCol.querySelector('.edit-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(e.currentTarget.getAttribute('data-index'));
                    if (!isNaN(index)) {
                        openOfferModal(index);
                    }
                });
                
                offerCol.querySelector('.delete-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(e.currentTarget.getAttribute('data-index'));
                    if (!isNaN(index)) {
                        deleteOffer(index);
                    }
                });
            } else if (i < debts.length) {
                // Mostrar botão para adicionar oferta se houver dívida sem oferta correspondente
                offerCol.innerHTML = `
                    <div class="offer-item">
                        <button class="btn btn-outline add-offer-btn" data-index="${i}">
                            <i class="fas fa-plus-circle"></i> Adicionar Oferta
                        </button>
                    </div>
                `;
                
                // Adicionar evento ao botão
                offerCol.querySelector('.add-offer-btn').addEventListener('click', function() {
                    openOfferModal();
                });
            } else {
                offerCol.innerHTML = '<div class="offer-item"></div>';
            }
            
            // Adicionar colunas à linha
            row.appendChild(debtCol);
            row.appendChild(offerCol);
            
            // Adicionar linha à tabela
            comparisonTableBody.appendChild(row);
        }
    }

    function deleteDebt(index) {
        if (index < 0 || index >= debts.length) {
            console.error('Índice de dívida inválido:', index);
            return;
        }

        if (confirm('Tem certeza que deseja remover esta dívida?')) {
            debts.splice(index, 1);
            
            // Remover oferta correspondente se existir
            if (index < offers.length) {
                offers.splice(index, 1);
            }
            
            updateUI();
        }
    }

    function deleteOffer(index) {
        if (index < 0 || index >= offers.length) {
            console.error('Índice de oferta inválido:', index);
            return;
        }

        if (confirm('Tem certeza que deseja remover esta oferta?')) {
            offers.splice(index, 1);
            updateUI();
        }
    }

    function updateSummaryCards() {
        const totalDebt = debts.reduce((sum, debt) => sum + debt, 0);
        const totalOffer = offers.reduce((sum, offer) => sum + (offer?.originalValue || 0), 0);
        const totalAdditional = offers.reduce((sum, offer) => sum + (offer?.additional || 0), 0);
        const totalWithAdditional = offers.reduce((sum, offer) => sum + (offer?.totalWithAdditional || 0), 0);
        
        // Calcular economia
        let economyPercentageValue = 0;
        if (totalDebt > 0 && offers.length > 0) {
            economyPercentageValue = ((totalDebt - totalWithAdditional) / totalDebt) * 100;
        }
        
        // Atualizar cards
        totalDebtCard.textContent = formatCurrency(totalDebt);
        totalOfferCard.textContent = formatCurrency(totalOffer);
        economyPercentage.textContent = `${Math.max(0, economyPercentageValue).toFixed(2)}%`;
        finalValueCard.textContent = formatCurrency(totalWithAdditional);
        
        // Atualizar total na tabela
        totalDebtElement.textContent = formatCurrency(totalDebt);
    }

    function updateOfferSummary() {
        const totalDebt = debts.reduce((sum, debt) => sum + debt, 0);
        const totalOffer = offers.reduce((sum, offer) => sum + (offer?.originalValue || 0), 0);
        const totalAdditional = offers.reduce((sum, offer) => sum + (offer?.additional || 0), 0);
        const totalWithAdditional = offers.reduce((sum, offer) => sum + (offer?.totalWithAdditional || 0), 0);
        const economyValue = totalDebt - totalWithAdditional;
        const economyPercentageValue = totalDebt > 0 ? (economyValue / totalDebt) * 100 : 0;
        
        // Encontrar o maior número de parcelas
        const maxInstallments = offers.reduce((max, offer) => 
            offer?.paymentType === 'installment' ? Math.max(max, offer?.installments || 0) : max, 0);
        
        let summaryHTML = `
            <p class="summary-title">RESUMO DA OFERTA</p>
            <div class="summary-content">
                <p>
                    <span>Total Ofertado:</span>
                    <span>${formatCurrency(totalOffer)}</span>
                </p>
                <p>
                    <span>Total Acréscimo:</span>
                    <span>${formatCurrency(totalAdditional)}</span>
                </p>
                <p>
                    <span>Total com Acréscimo:</span>
                    <span>${formatCurrency(totalWithAdditional)}</span>
                </p>
                <p>
                    <span>Economia Total:</span>
                    <span>${formatCurrency(Math.max(0, economyValue))} (${Math.max(0, economyPercentageValue).toFixed(2)}%)</span>
                </p>
        `;
        
        if (maxInstallments > 0) {
            summaryHTML += `
                <p>
                    <span>Número de Parcelas:</span>
                    <span>${maxInstallments}</span>
                </p>
                <p style="margin-top: 0.5rem; font-weight: 500;">Valor das Parcelas:</p>
            `;
            
            // Calcular valores das parcelas considerando todas as ofertas
            const installmentsValues = [];
            
            for (let i = 0; i < maxInstallments; i++) {
                let installmentSum = 0;
                
                for (const offer of offers) {
                    if (!offer) continue;
                    
                    if (offer.paymentType === 'installment' && i < offer.installments) {
                        installmentSum += offer.installmentValue || 0;
                    } else if (offer.paymentType === 'cash' && i === 0) {
                        installmentSum += offer.totalWithAdditional || 0;
                    }
                }
                
                if (installmentSum > 0) {
                    installmentsValues.push({
                        number: i + 1,
                        value: installmentSum
                    });
                }
            }
            
            installmentsValues.forEach(item => {
                summaryHTML += `
                    <div class="installment-row">
                        <span>Parcela ${item.number}:</span>
                        <span>${formatCurrency(item.value)}</span>
                    </div>
                `;
            });
        }
        
        summaryHTML += `</div>`;
        offerSummaryElement.innerHTML = summaryHTML;
    }

    function updateCTA() {
        const totalDebt = debts.reduce((sum, debt) => sum + debt, 0);
        const totalWithAdditional = offers.reduce((sum, offer) => sum + (offer?.totalWithAdditional || 0), 0);
        const economyValue = totalDebt - totalWithAdditional;
        const economyPercentageValue = totalDebt > 0 ? (economyValue / totalDebt) * 100 : 0;
        
        ctaFinalValue.textContent = formatCurrency(totalWithAdditional);
        ctaEconomyValue.textContent = `${formatCurrency(Math.max(0, economyValue))} (${Math.max(0, economyPercentageValue).toFixed(2)}%)`;
    }

    function clearAll() {
        if (confirm('Tem certeza que deseja limpar todas as dívidas e ofertas?')) {
            debts = [];
            offers = [];
            updateUI();
        }
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    // Tratamento de erros não capturados
    window.addEventListener('error', function(e) {
        console.error('Erro não tratado:', e.message, 'em', e.filename, 'linha:', e.lineno);
        alert('Ocorreu um erro inesperado. Por favor, recarregue a página.');
    });
});