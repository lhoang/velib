<script>
    import Wheel from './viz/Wheel.svelte';
    import Distance from './viz/Distance.svelte';
    import Details from './viz/Details.svelte';
    import {getData} from './velib.service.js';
    import {
        buildDistancePoints,
        cleanAndSort,
        findMaxDistanceForWheels,
        getCoursesByMonthAndDay
    } from "./velib.service";

    export let source = '';
    let allCourses = [];
    let coursesByMonth = [];
    let distancePoints = [];
    let totalDistance = 1018.3;
    let nbWheels = 2;
    let showGetDataExpl = false;
    let showWhere = false;
    let showHow = false;
    let showSidebar = true;

    let input = '';
    let errorMsg = undefined;

    $:(async () => getData(source).then(result => allCourses = result))();

    $: coursesByMonth = getCoursesByMonthAndDay(allCourses, nbWheels);
    $: maxDistance = findMaxDistanceForWheels(coursesByMonth) * 1.2;

    $: distancePoints = buildDistancePoints(allCourses, totalDistance);

    const updateData = () => {
        if (input) {
            try {
                const userData = JSON.parse(input);
                if (userData.walletOperations) {
                    allCourses = cleanAndSort(userData.walletOperations);
                    errorMsg = undefined;
                }
            } catch (e) {
                errorMsg = 'Format incorrect (doit contenir un attribut walletOperations)';
            }
        }
    };

    const toggleData = () => showGetDataExpl = !showGetDataExpl;
    const toggleWhere = () => showWhere = !showWhere;
    const toggleHow = () => showHow = !showHow;
    const close = () => showSidebar = false;
    const open = () => showSidebar = true;

</script>


<main>
    <h1>Stats Vélib</h1>
    <div class="container">
        <div class="details">
            <Details></Details>
        </div>
        <div class="wheels">
            {#if coursesByMonth.length === 0}
                ...loading...
            {:else}
                {#each coursesByMonth as [month, courses], i}
                    <Wheel {month}
                           data={courses}
                           {maxDistance}
                           width="350"
                    ></Wheel>
                {/each}
            {/if}
        </div>

        <div class="distance">
            {#if distancePoints.length === 0}
                ...loading...
            {:else}
                <Distance points={distancePoints} height="300" width="700">
                </Distance>
            {/if}
        </div>

    </div>

    <div class="sidebar" class:hide={!showSidebar}>
        <div class="border" on:click={open}></div>
        <div class="content">
            <div class="header">
                <h3>Données & explications</h3>
                <div class="close-btn" on:click={close}>×</div>
            </div>
            <div class="input">
                <label for="inputData">Données JSON :
                    <button class="update-btn" on:click={updateData}>🔄 Rafraîchir</button>
                </label>
                {#if errorMsg}
                    <div class="error">{errorMsg}</div>
                {/if}
                <textarea id="inputData" name="data"
                          rows="3" cols="26"
                          bind:value={input}
                          placeholder="Copier-coller ici les données JSON Vélib"
                ></textarea>
            </div>
            <div class="input-distance">
                <label for="totalDistance">Distance totale :&nbsp; </label>
                <input type="text" bind:value={totalDistance} size="4"/>km
            </div>
            <div class="input-nb-wheels">
                <label for="totalDistance">Nombre de roues: </label>
                <input type="range" bind:value={nbWheels} min="1" max="6"/>
            </div>
            <div class="explanations">
                <h4>Comment récupérer ses données
                    <span class="expand-btn" on:click={toggleData}>{showGetDataExpl ? '🔼': '🔽'}</span>
                </h4>
                {#if showGetDataExpl}
                    <ol>
                        <li>
                            Depuis Firefox ou Chrome, se connecter sur <a href="https://www.velib-metropole.fr/">son
                            compte
                            Vélib</a>.
                        </li>
                        <li>
                            Cliquer sur <a target="-_blank"
                                           href="https://www.velib-metropole.fr/webapi/private/getCourseList?limit=150&offset=0">lien
                            suivant</a>.
                            <br>La réponse JSON s'affiche dans un nouvel onglet.
                            <strong>Cela ne fonctionne que parce que vous êtes déjà connectés (utilisation du
                                cookie).</strong>
                        </li>
                        <li>
                            Ajuster dans l'URL le paramètre 'limit' : il représente le nombre de courses à retourner.
                        </li>
                        <li>Copier ces données brutes dans le champ "Données JSON" du formulaire ci-dessus</li>
                        <li>Renseigner le champ "Distance totale" avec les "km parcouru(s) au total" indiqués sur le
                            site
                            Vélib
                        </li>
                    </ol>
                {/if}
                <h4>
                    Où transitent mes données ?
                    <span class="expand-btn" on:click={toggleWhere}>{showWhere ? '🔼': '🔽'}</span>
                </h4>
                {#if showWhere}
                    <p>
                        Cette application est une page statique. Les données restent dans votre navigateur.
                    </p>
                {/if}
                <h4>
                    Avec quelle stack technique ?
                    <span class="expand-btn" on:click={toggleHow}>{showHow ? '🔼': '🔽'}</span>
                </h4>
                {#if showHow}
                    <p>
                        L'application est faite en JS avec <a href="https://svelte.dev/"> Svelte</a> et
                        <a href="https://d3js.org/">D3</a>, déployée sur <a href="https://surge.sh/">Surge</a>.
                        <br><a href="https://github.com/lhoang/velib">Dépôt Github</a>
                        <br>
                        Les vélos défectueux sont détectés de la manière suivante.
                        <br>Un vélo est considéré défectueux si
                        la durée est inférieure à 1 min
                        <br>ou s'il y a eu un changement de vélo en moins de 5 min
                        <br>ou si la distance est inférieure à 100m.
                    </p>
                {/if}
            </div>
        </div>
    </div>
</main>

<style>
    * {
        --velib-blue: #a3d2da;
        --velib-blue-dark: #8fb8bf;
        --velib-green: #80b85c;
        --velib-green-dark: #6a9c4e;
        --faulty: #b86575;
    }

    main {
        margin: 0;
    }

    h1, h2, h3, text {
        font-family: 'Nunito', sans-serif;
    }

    .sidebar {
        position: fixed;
        top: 0;
        right: 0;
        width: 17rem;
        height: 100%;
        background-color: whitesmoke;
        transform: translate3d(0, 0, 0);
        transition-delay: 0s;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
    }

    .sidebar .border {
        background-color: var(--velib-blue-dark);
        width: 1.5rem;
    }

    .sidebar .content {
        padding: 1rem .5rem;
    }

    .sidebar.hide {
        transform: translate3d(94%, 0, 0);
    }

    .sidebar h3 {
        margin: .5rem .5rem .5rem 0;
    }

    .sidebar .header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .close-btn {
        color: #777;
        font: 2rem arial, sans-serif;
        position: relative;
        top: -17px;
        text-decoration: none;
        text-shadow: 0 1px 0 #fff;
        cursor: pointer;
    }

    .input-distance {
        display: flex;
        flex-direction: row;
    }

    input[type=range] {
        height: 1.1rem;
    }

    .update-btn {
        padding: .5rem;
        margin: 0;
        border: none;
        font-size: 1rem;
    }

    .error {
        color: darkred;
        font-size: .8rem;
    }

    .container {
        display: flex;
        flex-direction: column;
    }

    .wheels {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .explanations {
        font-size: .8rem;
    }

    .explanations h4 {
        margin-bottom: 0;
    }

    .explanations ol, p {
        margin: .2rem;
    }

    .expand-btn {
        font-size: 1rem;
        cursor: s-resize;
    }

</style>