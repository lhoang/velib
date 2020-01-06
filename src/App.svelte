<script>
    import Wheel from './viz/Wheel.svelte';
    import Distance from './viz/Distance.svelte';
    import Details from './viz/Details.svelte';
    import {getData} from './velib.service.js';
    import {buildDistancePoints, cleanAndSort, getCoursesByMonthAndDay} from "./velib.service";

    export let source = '';
    let allCourses = [];
    let coursesByMonth = [];
    let distancePoints = [];
    let totalDistance = 965.1;
    let showGetDataExpl = false;
    let showWhere = false;
    let showHow = false;

    let input = '';
    let errorMsg = undefined;

    $:(async () => getData(source).then(result => allCourses = result))();

    $: coursesByMonth = getCoursesByMonthAndDay(allCourses);
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
                           maxDistance="38"
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

    <div class="sidebar">
        <div class="input">
            <label for="inputData">Données JSON :
                <button class="update-btn" on:click={updateData}>🔄</button>
            </label>
            {#if errorMsg}
                <div class="error">{errorMsg}</div>
            {/if}
            <textarea id="inputData" name="data"
                      rows="3" cols="33"
                      bind:value={input}
                      placeholder="Copier-coller ici les données JSON Vélib"
            ></textarea>
        </div>
        <div class="input-distance">
            <label for="totalDistance">Distance totale : </label>
            <input type="text" bind:value={totalDistance} size="4"/>km
        </div>
        <div class="explanations">
            <h4>Comment récupérer ses données
                <span on:click={toggleData}>{showGetDataExpl ? '🔼': '🔽'}</span>
            </h4>
            {#if showGetDataExpl}
                <ol>
                    <li>
                        Depuis Firefox ou Chrome, se connecter sur <a href="https://www.velib-metropole.fr/">son compte
                        Vélib</a>.
                    </li>
                    <li>
                        Apputer sur F12 pour afficher les DevTools, choisir l'onglet "Réseau". Filtrer par "XHR".
                    </li>
                    <li>Cliquer sur le bouton "Accéder le détail de mes trajets"</li>
                    <li>Repérer dans les appels la ligne "getCourseList?limit=10&offset=0". Cliquer-droit pour afficher
                        dans un nouvel onglet.
                    </li>
                    <li>
                        Modifier dans l'URL le paramètre 'limit' (qui est à 10) en l'augmentant à 200 par ex.
                    </li>
                    <li>Copier ces données brutes dans le champ "Données JSON" du formulaire ci-dessus</li>
                    <li>Renseigner le champ "Distance totale" avec les "km parcouru(s) au total" indiqués sur le site
                        Vélib
                    </li>
                </ol>
            {/if}
            <h4>
                Où transitent mes données ?
                <span on:click={toggleWhere}>{showWhere ? '🔼': '🔽'}</span>
            </h4>
            {#if showWhere}
                <p>
                    Cette application est une page statique. Les données restent dans votre navigateur.
                </p>
            {/if}
            <h4>
                Avec quelle stack technique ?
                <span on:click={toggleHow}>{showHow ? '🔼': '🔽'}</span>
            </h4>
            {#if showHow}
                <p>
                    L'application est faite en JS avec <a href="https://svelte.dev/"> Svelte</a> et
                    <a href="https://d3js.org/">D3</a>, déployée sur <a href="https://surge.sh/">Surge</a>.
                    <br><a href="https://github.com/lhoang/velib">Dépôt Github</a>
                    <br>
                    Les vélos défectueux sont détectés de la manière suivante : un vélo est considéré défectueux si
                    la durée est inférieure à 1 min ou s'il y a eu un changement de vélo en moins de 5 min.
                </p>
            {/if}

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
        right: 1rem;
        width: 16rem;
        border-left: 5px solid var(--velib-blue-dark);
        padding: 1rem .5rem;
    }

    .input-distance {
        display: flex;
        flex-direction: row;
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

</style>